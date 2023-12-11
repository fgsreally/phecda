import type { Express, Router } from 'express'
import { Context, singletonConf } from '../context'
import { isObject } from '../utils'
import { resolveDep } from '../helper'
import { APP_SYMBOL, MERGE_SYMBOL, META_SYMBOL, MODULE_SYMBOL, SERIES_SYMBOL } from '../common'
import type { Factory } from '../core'
import { BadRequestException, FrameworkException } from '../exception'
import type { Meta } from '../meta'

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
  middlewares?: string[]

  /**
   * allow parallel request,default is true
   */
  parallel?: boolean

  /**
   * allow series request,default is true
   */
  series?: boolean
}

export function bindApp(app: Router, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, options: Options = {}) {
  const { globalGuards, globalInterceptors, route, middlewares: proMiddle, parallel = true, series = true } = { route: '/__PHECDA_SERVER__', globalGuards: [], globalInterceptors: [], middlewares: [], ...options } as Required<Options>
  (app as any)[APP_SYMBOL] = { moduleMap, meta }

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
    (app as Express).post(route, (req, _res, next) => {
      (req as any)[MERGE_SYMBOL] = true;
      (req as any)[MODULE_SYMBOL] = moduleMap;
      (req as any)[META_SYMBOL] = meta

      next()
    }, ...Context.useMiddleware(proMiddle), async (req, res) => {
      const { body: { category, data } } = req

      async function errorHandler(e: any) {
        const error = await singletonConf.filter(e)
        return res.status(error.status).json(error)
      }

      if (!Array.isArray(data))
        return errorHandler(new BadRequestException('data format should be an array'))

      if (category !== 'series' && category !== 'parallel')
        return errorHandler(new BadRequestException('category should be \'parallel\' or \'series\''))

      const ret = [] as any[]
      try {
        if (category === 'series') {
          if (!series)
            return errorHandler(new FrameworkException('series request is not allowed'))

          for (const item of data) {
            const { tag } = item
            const contextData = {
              type: 'express',
              request: req,
              meta: metaMap.get(tag)!,
              response: res,
              moduleMap,

            }
            const context = new Context(tag, contextData)
            try {
              const [name, method] = tag.split('-')
              const {
                reflect,
                data: {
                  params,
                  guards,
                  interceptors,
                },
              } = contextData.meta
              const instance = moduleMap.get(name)
              if (!params)
                throw new BadRequestException(`"${tag}" doesn't exist`)

              await context.useGuard([...globalGuards, ...guards])
              if (await context.useInterceptor([...globalInterceptors, ...interceptors])
              ) return
              const args = await context.usePipe(params.map(({ type, key, option, index }) => {
                const arg = resolveDep(item[type], key)
                if (typeof arg === 'string' && arg.startsWith(SERIES_SYMBOL)) {
                  const [, argIndex, argKey] = arg.split('@')
                  return { arg: resolveDep(ret[Number(argIndex)], argKey || key), option, index, type, key, reflect: reflect[index] }
                }

                return { arg, option, index, type, key, reflect: reflect[index] }
              })) as any
              instance.context = contextData
              const funcData = await moduleMap.get(name)[method](...args)

              ret.push(await context.usePostInterceptor(funcData))
            }
            catch (e: any) {
              const m = metaMap.get(tag)!
              m.handlers.forEach(handler => handler.error?.(e))
              ret.push(await context.useFilter(e))
            }
          }

          return res.json(ret)
        }
        if (category === 'parallel') {
          if (!parallel)
            return errorHandler(new FrameworkException('parallel request is not allowed'))

          return Promise.all(data.map((item: any) => {
            // eslint-disable-next-line no-async-promise-executor
            return new Promise(async (resolve) => {
              const { tag } = item
              const contextData = {
                type: 'express',

                request: req,
                meta: metaMap.get(tag)!,
                response: res,
                moduleMap,
              }
              const context = new Context(tag, contextData)
              const [name, method] = tag.split('-')
              const {
                reflect,

                handlers,

                data: {
                  params,
                  guards, interceptors,
                },
              } = metaMap.get(tag)!

              const instance = moduleMap.get(name)

              try {
                if (!params)
                  throw new BadRequestException(`"${tag}" doesn't exist`)
                await context.useGuard([...globalGuards, ...guards])
                if (await context.useInterceptor([...globalInterceptors, ...interceptors])
                ) return
                const args = await context.usePipe(params.map(({ type, key, option, index }) => {
                  const arg = resolveDep(item[type], key)
                  return { arg, type, key, option, index, reflect: reflect[index] }
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
          })).then((ret) => {
            res.json(ret)
          })
        }
      }
      catch (e) {
        return errorHandler(e)
      }
    })
    for (const i of meta) {
      const { method, http, header, tag } = i.data

      if (!http?.type)
        continue

      const methodTag = `${tag}-${method}`

      const {
        reflect,
        handlers,
        data: {
          interceptors,
          guards,
          params,
          middlewares,
        },
      } = metaMap.get(methodTag)!;

      (app as Express)[http.type](http.route, (req, _res, next) => {
        (req as any)[MODULE_SYMBOL] = moduleMap;
        (req as any)[META_SYMBOL] = meta
        next()
      }, ...Context.useMiddleware(middlewares), async (req, res) => {
        const instance = moduleMap.get(tag)!
        const contextData = {
          type: 'express',
          request: req,
          meta: i,
          response: res,
          moduleMap,
        }
        const context = new Context(methodTag, contextData)

        try {
          for (const name in header)
            res.set(name, header[name])
          await context.useGuard([...globalGuards, ...guards])
          if (await context.useInterceptor([...globalInterceptors, ...interceptors]))
            return

          const args = await context.usePipe(params.map(({ type, key, option, index }) => {
            return { arg: resolveDep((req as any)[type], key), option, key, type, index, reflect: reflect[index] }
          }))

          instance.context = contextData
          const funcData = await instance[method](...args)
          const ret = await context.usePostInterceptor(funcData)

          if (isObject(ret))
            res.json(ret)
          else
            res.send(String(ret))
        }
        catch (e: any) {
          handlers.forEach(handler => handler.error?.(e))
          const err = await context.useFilter(e)
          res.status(err.status).json(err)
        }
      })
    }
  }

  handleMeta()
  createRoute()
  if (process.env.NODE_ENV === 'development') {
    // @ts-expect-error globalThis
    const rawMetaHmr = globalThis.__PS_WRITEMETA__
    // @ts-expect-error globalThis

    globalThis.__PS_WRITEMETA__ = () => {
      app.stack = []// app.stack.slice(0, 1)
      handleMeta()

      createRoute()
      rawMetaHmr?.()
    }
  }
}
