import type Router from '@koa/router'
import type { RouterParamContext } from '@koa/router'
import type { DefaultContext, DefaultState } from 'koa'
import { argToReq, resolveDep } from '../helper'
import { APP_SYMBOL, IS_DEV, MERGE_SYMBOL, META_SYMBOL, MODULE_SYMBOL } from '../../common'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import type { Meta } from '../../meta'
import { Context, isAopDepInject } from '../../context'
import type { P } from '../../types'
export interface KoaCtx extends P.HttpContext {
  type: 'koa'
  ctx: DefaultContext & RouterParamContext<DefaultState, DefaultContext>
  next: Function
}
export interface Options {

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
 * 专用路由的插件(work for merge request)，
 */
  plugins?: string[]

}

export function bindApp(app: Router, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, options: Options = {}) {
  const { globalGuards, globalInterceptors, route, plugins } = { route: '/__PHECDA_SERVER__', globalGuards: [], globalInterceptors: [], plugins: [], ...options } as Required<Options>
  IS_DEV && isAopDepInject(meta, {
    plugins,
    guards: globalGuards,
    interceptors: globalInterceptors,
  });

  (app as any)[APP_SYMBOL] = { moduleMap, meta }

  const metaMap = new Map<string, Meta>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, method, http } = item.data
      if (!http?.type)
        continue
      const methodTag = `${tag as string}-${method}`
      metaMap.set(methodTag, item)
    }
  }

  async function createRoute() {
    app.post(route, async (ctx, next) => {
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
            const { tag } = item
            const meta = metaMap.get(tag)
            if (!meta)
              return resolve(await Context.filterRecord.default(new BadRequestException(`"${tag}" doesn't exist`)))

            const [name, method] = tag.split('-')
            const {
              paramsType,
              handlers,
              data: {
                params,
                guards, interceptors,
                filter,
              },
            } = meta

            const instance = moduleMap.get(name)
            const contextData = {
              type: 'koa' as const,
              index: i,
              ctx,
              meta,
              moduleMap,
              parallel: true,
              next,
              ...argToReq(params, item.args, ctx.headers),
              tag,
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
              instance.context = contextData
              const funcData = await moduleMap.get(name)[method](...args)
              resolve(await context.usePostInterceptor(funcData))
            }
            catch (e: any) {
              handlers.forEach(handler => handler.error?.(e, context.data))
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

      const methodTag = `${tag as string}-${method}`

      const {
        paramsType,
        handlers,
        data: {
          interceptors,
          guards,
          params,
          plugins,
          filter,
        },
      } = metaMap.get(methodTag)!
      app[http.type](http.route, async (ctx, next) => {
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
          tag: methodTag,
          query: ctx.query,
          params: ctx.params,
          body: (ctx.request as any).body,
          headers: ctx.headers,
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

          instance.context = contextData
          const funcData = await instance[method](...args)
          const ret = await context.usePostInterceptor(funcData)
          if (ctx.res.writableEnded)
            return
          ctx.body = ret
        }
        catch (e: any) {
          handlers.forEach(handler => handler.error?.(e, context.data))
          const err = await context.useFilter(e, filter)

          if (ctx.res.writableEnded)
            return
          ctx.status = err.status
          ctx.body = err
        }
      })
    }
  }

  handleMeta()
  createRoute()
  if (IS_DEV) {
    globalThis.__PS_HMR__?.push(async () => {
      isAopDepInject(meta, {
        plugins,
        guards: globalGuards,
        interceptors: globalInterceptors,
      })

      app.stack = []// app.stack.slice(0, 1)
      handleMeta()
      createRoute()
    })
  }
}
