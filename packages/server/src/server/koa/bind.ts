import type Router from '@koa/router'
import type { RouterParamContext } from '@koa/router'
import type { DefaultContext, DefaultState } from 'koa'
import type { ServerOptions } from '../helper'
import { argToReq, resolveDep } from '../helper'
import { MERGE_SYMBOL, META_SYMBOL, MODULE_SYMBOL, PS_SYMBOL } from '../../common'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import type { Meta } from '../../meta'
import { Context, detectAopDep } from '../../context'
import type { P } from '../../types'
import { HMR } from '../../hmr'
export interface KoaCtx extends P.HttpContext {
  type: 'koa'
  ctx: DefaultContext & RouterParamContext<DefaultState, DefaultContext>
  next: Function
}

export function bind(router: Router, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, ServerOptions: ServerOptions = {}) {
  const { globalGuards, globalInterceptors, route, plugins } = { route: '/__PHECDA_SERVER__', globalGuards: [], globalInterceptors: [], plugins: [], ...ServerOptions } as Required<ServerOptions>

  const originStack = router.stack.slice(0, router.stack.length);

  (router as any)[PS_SYMBOL] = { moduleMap, meta }

  const metaMap = new Map<string, Record<string, Meta>>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, method, http, guards, interceptors } = item.data
      if (!http?.type)
        continue

      detectAopDep(meta, {
        plugins,
        guards,
        interceptors,
      })
      if (metaMap.has(tag))
        metaMap.get(tag)![method] = item

      else
        metaMap.set(tag, { [method]: item })
    }
  }
  async function createRoute() {
    router.post(route, async (ctx, next) => {
      ctx[MERGE_SYMBOL] = true
      ctx[MODULE_SYMBOL] = moduleMap
      ctx[META_SYMBOL] = meta

      await next()
    }, ...Context.usePlugin(plugins), async (ctx, next) => {
      const { body } = ctx.request as any

      async function errorHandler(e: any) {
        const error = await Context.filterRecord.default(e)
        ctx.status = error.status
        ctx.body = error
      }

      if (!Array.isArray(body))
        return errorHandler(new BadRequestException('data format should be an array'))

      try {
        return Promise.all(body.map((item: any, i) => {
          // eslint-disable-next-line no-async-promise-executor
          return new Promise(async (resolve) => {
            const { tag, method } = item
            const meta = metaMap.get(tag)![method]
            if (!meta)
              return resolve(await Context.filterRecord.default(new BadRequestException(`"${tag}" doesn't exist`)))

            const {
              paramsType,
              data: {
                params,
                guards, interceptors,
                filter,
                ctx: CTX,
              },
            } = meta

            const instance = moduleMap.get(tag)
            const contextData = {
              type: 'koa' as const,
              index: i,
              ctx,
              meta,
              moduleMap,
              parallel: true,
              next,
              data: (ctx as any).data,

              ...argToReq(params, item.args, ctx.headers),
              tag,
              method,
            }
            const context = new Context<KoaCtx>(contextData)

            try {
              await context.useGuard([...globalGuards, ...guards])
              const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
              if (cache !== undefined)
                return resolve(cache)
              const args = await context.usePipe(params.map(({ type, key, pipeOpts, pipe, index }) => {
                return { arg: item.args[index], type, key, pipeOpts, pipe, index, reflect: paramsType[index] }
              })) as any
              if (CTX)
                instance[CTX] = contextData
              const funcData = await instance[method](...args)
              resolve(await context.usePostInterceptor(funcData))
            }
            catch (e: any) {
              resolve(await context.useFilter(e, filter))
            }
          })
        })).then((ret) => {
          ctx.body = ret
        })
      }
      catch (e) {
        return errorHandler(e)
      }
    })
    for (const i of meta) {
      const { method, http, header, tag } = i.data

      if (!http?.type)
        continue

      const {
        paramsType,
        data: {
          interceptors,
          guards,
          params,
          plugins,
          filter,
          ctx: CTX,
        },
      } = metaMap.get(tag)![method]

      router[http.type](http.route, async (ctx, next) => {
        ctx[MODULE_SYMBOL] = moduleMap
        ctx[META_SYMBOL] = meta
        await next()
      }, ...Context.usePlugin(plugins), async (ctx, next) => {
        const instance = moduleMap.get(tag)!
        const contextData = {
          type: 'koa' as const,
          ctx,
          meta: i,
          moduleMap,
          parallel: false,
          tag,
          method,
          query: ctx.query,
          params: ctx.params,
          body: (ctx.request as any).body,
          headers: ctx.headers,
          data: (ctx as any).data,
          next,
        }
        const context = new Context<KoaCtx>(contextData)

        try {
          for (const name in header)
            ctx.set(name, header[name])
          await context.useGuard([...globalGuards, ...guards])
          const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
          if (cache !== undefined) {
            ctx.body = cache
            return
          }
          const args = await context.usePipe(params.map(({ type, key, pipeOpts, index, pipe }) => {
            return { arg: resolveDep(context.data[type], key), pipeOpts, pipe, key, type, index, reflect: paramsType[index] }
          }))

          if (CTX)
            instance[CTX] = contextData
          const funcData = await instance[method](...args)
          const ret = await context.usePostInterceptor(funcData)
          if (ctx.res.writableEnded)
            return
          ctx.body = ret
        }
        catch (e: any) {
          const err = await context.useFilter(e, filter)

          if (ctx.res.writableEnded)
            return
          ctx.status = err.status
          ctx.body = err
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
    router.stack = originStack

    detectAopDep(meta, {
      plugins,
      guards: globalGuards,
      interceptors: globalInterceptors,
    })
    handleMeta()
    createRoute()
  })
}
