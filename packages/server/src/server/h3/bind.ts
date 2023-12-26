import { eventHandler, fromNodeMiddleware, getQuery, getRequestHeaders, getRouterParams, readBody, setHeaders, setResponseStatus } from 'h3'
import type { NodeMiddleware, Router } from 'h3'

import { resolveDep } from '../../helper'
import { APP_SYMBOL, IS_DEV, MERGE_SYMBOL, META_SYMBOL, MODULE_SYMBOL } from '../../common'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import type { Meta } from '../../meta'
import { Context } from '../../context'

export interface H3Ctx {
  type: 'h3'
  request: Request
  response: Response
  meta: Meta
  moduleMap: Record<string, any>
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
 * 专用路由的中间件(work for merge request)，全局中间件请在bindApp以外设置
 */
  plugins?: string[]

}

export function bindApp(router: Router, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, options: Options = {}) {
  const { globalGuards, globalInterceptors, route, plugins } = { route: '/__PHECDA_SERVER__', globalGuards: [], globalInterceptors: [], plugins: [], ...options } as Required<Options>
  (router as any)[APP_SYMBOL] = { moduleMap, meta }

  const metaMap = new Map<string, Meta>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, method, http } = item.data
      if (!http?.type)
        continue
      const methodTag = `${tag}-${method}`
      metaMap.set(methodTag, item)
    }
  }

  async function createRoute() {
    router.post(route, fromNodeMiddleware((req, _res, next) => {
      (req as any)[MERGE_SYMBOL] = true;
      (req as any)[MODULE_SYMBOL] = moduleMap;
      (req as any)[META_SYMBOL] = meta

      next()
    }))
    plugins.forEach((p) => {
      router.post(route, fromNodeMiddleware(Context.usePlugin([p])[0] as NodeMiddleware))
    })

    router.post(route, eventHandler(async (event) => {
      const body = await readBody(event, { strict: true })
      async function errorHandler(e: any) {
        const error = await Context.filter(e)
        setResponseStatus(event, error.status)
        return error
      }

      if (!Array.isArray(body))
        return errorHandler(new BadRequestException('data format should be an array'))

      try {
        return Promise.all(body.map((item: any) => {
          // eslint-disable-next-line no-async-promise-executor
          return new Promise(async (resolve) => {
            const { tag } = item
            const meta = metaMap.get(tag)!
            if (!meta)
              return resolve(await Context.filter(new BadRequestException(`"${tag}" doesn't exist`)))

            const contextData = {
              type: 'h3' as const,
              event,
              meta,
              moduleMap,
            }
            const context = new Context(tag, contextData)
            const [name, method] = tag.split('-')
            const {
              paramsType,
              handlers,
              data: {
                params,
                guards, interceptors,
              },
            } = metaMap.get(tag)!

            const instance = moduleMap.get(name)

            try {
              await context.useGuard([...globalGuards, ...guards])
              const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
              if (cache !== undefined)
                return resolve(cache)
              const args = await context.usePipe(params.map(({ type, key, pipe, pipeOpts, index }) => {
                return { arg: item.args[index], type, key, pipe, pipeOpts, index, reflect: paramsType[index] }
              })) as any
              instance.context = contextData
              const funcData = await moduleMap.get(name)[method](...args)
              resolve(await context.usePostInterceptor(funcData))
            }
            catch (e: any) {
              handlers.forEach(handler => handler.error?.(e))
              resolve(await context.useFilter(e))
            }
          })
        }))
      }

      catch (e) {
        return errorHandler(e)
      }
    }))
    for (const i of meta) {
      const { method, http, header, tag } = i.data

      if (!http?.type)
        continue

      const methodTag = `${tag}-${method}`

      const {
        paramsType,
        handlers,
        data: {
          interceptors,
          guards,
          params,
          plugins,
        },
      } = metaMap.get(methodTag)!

      router[http.type](http.route, fromNodeMiddleware((req, _res, next) => {
        (req as any)[MODULE_SYMBOL] = moduleMap;
        (req as any)[META_SYMBOL] = meta
        next()
      }))

      for (const p of plugins)
        router[http.type](http.route, fromNodeMiddleware(Context.usePlugin([p])[0]))

      router[http.type](http.route, eventHandler(async (event) => {
        const instance = moduleMap.get(tag)!

        const contextData = {
          type: 'h3' as const,
          meta: i,
          event,
          moduleMap,
        }
        const context = new Context(methodTag, contextData)

        try {
          setHeaders(event, header)
          await context.useGuard([...globalGuards, ...guards])
          const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
          if (cache !== undefined)
            return cache

          const body = params.some(item => item.type === 'body') ? await readBody(event, { strict: true }) : undefined
          const args = await context.usePipe(params.map(({ type, key, pipe, pipeOpts, index }) => {
            let arg: any

            switch (type) {
              case 'params':
                arg = getRouterParams(event)
                break
              case 'query':
                arg = getQuery(event)
                break
              case 'header':
                arg = getRequestHeaders(event)
                break
              default:
                arg = body
            }

            return { arg: resolveDep(arg, key), pipe, pipeOpts, key, type, index, reflect: paramsType[index] }
          }))

          instance.context = contextData
          const funcData = await instance[method](...args)
          const ret = await context.usePostInterceptor(funcData)

          return ret
        }
        catch (e: any) {
          handlers.forEach(handler => handler.error?.(e))
          const err = await context.useFilter(e)
          setResponseStatus(event, err.status)
          return err
        }
      }))
    }
  }

  handleMeta()
  createRoute()
  if (IS_DEV) {
    // @ts-expect-error globalThis
    const rawMetaHmr = globalThis.__PS_WRITEMETA__
    // @ts-expect-error globalThis

    globalThis.__PS_WRITEMETA__ = () => {
      handleMeta()
      // createRoute()
      rawMetaHmr?.()
    }
  }
}