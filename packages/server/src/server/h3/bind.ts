import type { IncomingHttpHeaders } from 'node:http'
import { defineRequestMiddleware, eventHandler, getQuery, getRequestHeaders, getRouterParams, readBody, setHeaders, setResponseStatus } from 'h3'
import type { H3Event, Router } from 'h3'
import Debug from 'debug'
import { argToReq } from '../helper'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import type { ControllerMeta } from '../../meta'
import { Context, detectAopDep } from '../../context'
import type { HttpContext } from '../../types'
import { HMR } from '../../hmr'

const debug = Debug('phecda-server/h3')

export interface H3Ctx extends HttpContext {
  type: 'h3'
  event: H3Event
}
export interface ServerOptions {

  /**
 * 专用路由的值，默认为/__PHECDA_SERVER__，处理phecda-client发出的合并请求
 */
  route?: string
  /**
 * 全局守卫
 */
  globalGuards?: string[]
  /**
 * 全局拦截器
 */
  globalInterceptors?: string[]
  /**
 * 专用路由的中间件(work for merge request)，全局中间件请在bindApp以外设置
 */
  plugins?: string[]

}

export function bind(router: Router, data: Awaited<ReturnType<typeof Factory>>, ServerOptions: ServerOptions = {}) {
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
    router.post(route, eventHandler({
      onRequest: [...Context.usePlugin(plugins).map(p => defineRequestMiddleware(p))],
      handler: async (event) => {
        const body = await readBody(event, { strict: true })
        async function errorHandler(e: any) {
          const error = await Context.filterRecord.default(e)
          setResponseStatus(event, error.status)
          return error
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
                type: 'h3' as const,
                index: i,
                event,
                meta,
                moduleMap,
                tag,
                func,
                parallel: true,
                data: (event as any).data,
                ...argToReq(params, item.args, getRequestHeaders(event)),
              }
              const context = new Context<H3Ctx>(contextData)

              context.run(resolve, resolve)
            })
          }))
        }

        catch (e) {
          return errorHandler(e)
        }
      },
    }))

    for (const [tag, record] of metaMap) {
      for (const func in record) {
        const meta = metaMap.get(tag)![func]
        const {
          data: {
            http,
            params,
            plugins,

          },
        } = meta

        if (!http?.type)
          continue
        const needBody = params.some(item => item.type === 'body')
        router[http.type](http.prefix + http.route, eventHandler({
          onRequest: [...Context.usePlugin(plugins).map(p => defineRequestMiddleware(p))],
          handler: async (event) => {
            debug(`invoke method "${func}" in module "${tag}"`)

            const contextData = {
              type: 'h3' as const,
              meta,
              event,
              moduleMap,
              tag,
              func,
              headers: getRequestHeaders(event) as IncomingHttpHeaders,
              params: getRouterParams(event),
              query: getQuery(event),
              data: (event as any).data,

              body: needBody ? await readBody(event, { strict: true }) : undefined,
            }
            const context = new Context<H3Ctx>(contextData)
            setHeaders(event, http.headers || {})

            return await context.run(returnData => returnData, (err) => {
              setResponseStatus(event, err.status)
              return err
            })
          },
        }))
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
