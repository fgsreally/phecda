import type { IncomingHttpHeaders } from 'node:http'
import { defineRequestMiddleware, eventHandler, getQuery, getRequestHeaders, getRouterParams, readBody, setHeaders, setResponseStatus } from 'h3'
import type { H3Event, Router } from 'h3'
import { argToReq, resolveDep } from '../helper'
import { APP_SYMBOL, IS_DEV, META_SYMBOL, MODULE_SYMBOL } from '../../common'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import type { Meta } from '../../meta'
import { Context, isAopDepInject } from '../../context'
import type { P } from '../../types'

export interface H3Ctx extends P.HttpContext {
  type: 'h3'
  event: H3Event
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

  IS_DEV && isAopDepInject(meta, {
    plugins,
    guards: globalGuards,
    interceptors: globalInterceptors,
  });

  (router as any)[APP_SYMBOL] = { moduleMap, meta }

  const prePlugin = defineRequestMiddleware((event) => {
    (event as any)[MODULE_SYMBOL] = moduleMap;
    (event as any)[META_SYMBOL] = meta
  })
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
    router.post(route, eventHandler({
      onRequest: [prePlugin, ...Context.usePlugin(plugins).map(p => defineRequestMiddleware(p))],
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
              const { tag } = item
              const meta = metaMap.get(tag)!
              if (!meta)
                return resolve(await Context.filterRecord.default(new BadRequestException(`"${tag}" doesn't exist`)))

              const [name, method] = tag.split('-')
              const {
                paramsType,
                handlers,
                data: {
                  params,
                  guards,
                  interceptors, filter,
                },
              } = metaMap.get(tag)!

              const instance = moduleMap.get(name)
              const contextData = {
                type: 'h3' as const,
                index: i,
                event,
                meta,
                moduleMap,
                tag,
                ...argToReq(params, item.args, getRequestHeaders(event)),
              }
              const context = new Context<H3Ctx>(contextData)

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
                handlers.forEach(handler => handler.error?.(e, context.data))
                resolve(await context.useFilter(e, filter))
              }
            })
          }))
        }

        catch (e) {
          return errorHandler(e)
        }
      },
    }))

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

      const needBody = params.some(item => item.type === 'body')
      router[http.type](http.route, eventHandler({
        onRequest: [prePlugin, ...Context.usePlugin(plugins).map(p => defineRequestMiddleware(p))],
        handler: async (event) => {
          const instance = moduleMap.get(tag)!

          const contextData = {
            type: 'h3' as const,
            meta: i,
            event,
            moduleMap,
            tag: methodTag,
            headers: getRequestHeaders(event) as IncomingHttpHeaders,
            params: getRouterParams(event),
            query: getQuery(event),
            body: needBody ? await readBody(event, { strict: true }) : undefined,
          }
          const context = new Context<H3Ctx>(contextData)

          try {
            setHeaders(event, header)
            await context.useGuard([...globalGuards, ...guards])
            const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
            if (cache !== undefined)
              return cache

            const args = await context.usePipe(params.map(({ type, key, pipe, pipeOpts, index }) => {
              return { arg: resolveDep(context.data[type], key), pipe, pipeOpts, key, type, index, reflect: paramsType[index] }
            }))

            instance.context = contextData
            const funcData = await instance[method](...args)
            const ret = await context.usePostInterceptor(funcData)

            return ret
          }
          catch (e: any) {
            handlers.forEach(handler => handler.error?.(e, context.data))
            const err = await context.useFilter(e, filter)
            setResponseStatus(event, err.status)
            return err
          }
        },
      }))
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
      handleMeta()
    })
  }
}
