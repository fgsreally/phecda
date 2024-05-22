import Debug from 'debug'
import type { Hono, Context as HonoContext } from 'hono'
import type { ServerOptions } from '../helper'
import { argToReq, resolveDep } from '../helper'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import type { Meta } from '../../meta'
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
  const metaMap = new Map<string, Record<string, Meta>>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, func, http } = item.data
      if (!http?.type)
        continue

      debug(`register method "${func}" in module "${tag}"`)

      if (metaMap.has(tag))
        metaMap.get(tag)![func] = item

      else
        metaMap.set(tag, { [func]: item })
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
              paramsType,

              data: {
                ctx,
                params,
                guards, interceptors,
                filter,
              },
            } = meta

            const instance = moduleMap.get(tag)

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

            try {
              await context.useGuard([...globalGuards, ...guards])
              const i1 = await context.useInterceptor([...globalInterceptors, ...interceptors])
              if (i1 !== undefined)
                return resolve(i1)
              const args = await context.usePipe(params.map((param) => {
                return { arg: item.args[param.index], reflect: paramsType[param.index], ...param }
              })) as any
              if (ctx)
                instance[ctx] = contextData
              const funcData = await instance[func](...args)
              const i2 = await context.usePostInterceptor(funcData)
              if (i2)
                return resolve(i2)
              resolve(funcData)
            }
            catch (e: any) {
              resolve(await context.useFilter(e, filter))
            }
          })
        })).then((ret) => {
          return c.json(ret)
        })
      }
      catch (e) {
        return errorHandler(e)
      }
    })
    for (const i of meta) {
      const { func, http, header, tag } = i.data

      if (!http?.type)
        continue

      const {
        paramsType,
        data: {
          ctx,
          interceptors,
          guards,
          params,
          plugins,
          filter,
        },
      } = metaMap.get(tag)![func]

      const needBody = params.some(item => item.type === 'body')

      router[http.type](http.route, ...Context.usePlugin(plugins), async (c) => {
        debug(`invoke method "${func}" in module "${tag}"`)

        const instance = moduleMap.get(tag)!
        const contextData = {
          type: 'hono' as const,
          context: c,
          meta: i,
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

        try {
          for (const name in header)
            c.header(name, header[name])
          await context.useGuard([...globalGuards, ...guards])
          const i1 = await context.useInterceptor([...globalInterceptors, ...interceptors])
          if (i1 !== undefined)

            return i1

          const args = await context.usePipe(params.map((param) => {
            return { arg: resolveDep(context.data[param.type], param.key), reflect: paramsType[param.index], ...param }
          }))
          if (ctx)
            instance[ctx] = contextData
          const funcData = await instance[func](...args)
          const i2 = await context.usePostInterceptor(funcData)
          if (i2 !== undefined)
            return i2
          if (typeof funcData === 'string')
            return c.text(funcData)

          else
            return c.json(funcData)
        }
        catch (e: any) {
          const err = await context.useFilter(e, filter)

          c.status(err.status)
          return c.json(err)
        }
      })
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
