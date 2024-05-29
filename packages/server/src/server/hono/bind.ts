import Debug from 'debug'
import type { Hono, Context as HonoContext } from 'hono'
import type { ServerOptions } from '../helper'
import { argToReq } from '../helper'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import type { ControllerMeta } from '../../meta'
import { Context, detectAopDep } from '../../context'
import type { HttpContext } from '../../types'
import { HMR } from '../../hmr'
const debug = Debug('phecda-server/hono')
export interface HonoCtx extends HttpContext {
  type: 'hono'
  context: HonoContext
}

export function bind(router: Hono, data: Awaited<ReturnType<typeof Factory>>, ServerOptions: ServerOptions = {}) {
  const { globalGuards, globalInterceptors, route, plugins } = { route: '/__PHECDA_SERVER__', globalGuards: [], globalInterceptors: [], plugins: [], ...ServerOptions } as Required<ServerOptions>
  const { moduleMap, meta } = data
  const metaMap = new Map<string, Record<string, ControllerMeta>>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, func, controller, http } = item.data
      if (controller !== 'http' || !http?.type)
        continue

      debug(`register method "${func}" in module "${tag}"`)

      item.data.guards = [...globalGuards, item.data.guards]
      item.data.interceptors = [...globalInterceptors, item.data.interceptors]

      if (metaMap.has(tag))
        metaMap.get(tag)![func] = item as ControllerMeta

      else
        metaMap.set(tag, { [func]: item as ControllerMeta })
    }
  }

  async function createRoute() {
    router.post(route, ...Context.usePlugin(plugins), async (c) => {
      const body = await c.req.json()

      async function errorHandler(e: any) {
        const error = await Context.filterRecord.default(e)
        c.status(error.status)
        return c.json(error)
      }

      if (!Array.isArray(body))
        return errorHandler(new BadRequestException('data format should be an array'))

      try {
        return Promise.all(body.map((item: any, i) => {
          // eslint-disable-next-line no-async-promise-executor
          return new Promise(async (resolve) => {
            const { tag, func } = item

            debug(`(parallel)invoke method "${func}" in module "${tag}"`)

            if (!metaMap.has(tag))
              return resolve(await Context.filterRecord.default(new BadRequestException(`module "${tag}" doesn't exist`)))

            const meta = metaMap.get(tag)![func]
            if (!meta)
              return resolve(await Context.filterRecord.default(new BadRequestException(`"${func}" in "${tag}" doesn't exist`)))

            const {

              data: {
                params,

              },
            } = meta

            const contextData = {
              type: 'hono' as const,
              parallel: true,
              context: c,
              index: i,
              meta,
              moduleMap,
              tag,
              func,
              data: (c.req as any).data,
              ...argToReq(params, item.args, c.req.header()),
            }
            const context = new Context<HonoCtx>(contextData)

            context.run(resolve, resolve)
          })
        })).then((ret) => {
          return c.json(ret)
        })
      }
      catch (e) {
        return errorHandler(e)
      }
    })

    for (const [tag, record] of metaMap) {
      for (const func in record) {
        const meta = metaMap.get(tag)![func]

        const {
          data: {

            params,
            plugins,
            http,
          },
        } = meta

        if (!http?.type)
          continue
        const needBody = params.some(item => item.type === 'body')

        router[http.type](http.prefix + http.route, ...Context.usePlugin(plugins), async (c) => {
          debug(`invoke method "${func}" in module "${tag}"`)

          const contextData = {
            type: 'hono' as const,
            context: c,
            meta,
            moduleMap,
            tag,
            func,
            query: c.req.query(),
            body: needBody ? await c.req.json() : undefined,
            params: c.req.param() as any,
            headers: c.req.header(),
            data: (c.req as any).data,
          }

          const context = new Context<HonoCtx>(contextData)
          if (http.headers) {
            for (const name in http.headers)
              c.header(name, http.headers[name])
          }
          return context.run((returnData) => {
            if (returnData instanceof Response)
              return returnData

            if (typeof returnData === 'string')
              return c.text(returnData)

            else
              return c.json(returnData)
          }, (err) => {
            c.status(err.status)
            return c.json(err)
          })
        })
      }
    }
  }

  detectAopDep(meta, {
    plugins,
    guards: globalGuards,
    interceptors: globalInterceptors,
  })
  handleMeta()
  createRoute()

  HMR(async () => {
    detectAopDep(meta, {
      plugins,
      guards: globalGuards,
      interceptors: globalInterceptors,
    })
    handleMeta()
  })
}
