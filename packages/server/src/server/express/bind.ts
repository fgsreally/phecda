import type { Express, Router } from 'express'
import { isObject } from '../../utils'
import { resolveDep } from '../../helper'
import { APP_SYMBOL, MERGE_SYMBOL, META_SYMBOL, MODULE_SYMBOL } from '../../common'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import type { Meta } from '../../meta'
import { Context } from '../../context'

export interface ExpressCtx {
  type: 'express'
  request: Request
  response: Response
  meta: Meta
  moduleMap: Record<string, any>
  [key: string]: any
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
  middlewares?: string[]

}

export function bindApp(app: Router, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, options: Options = {}) {
  const { globalGuards, globalInterceptors, route, middlewares: proMiddle } = { route: '/__PHECDA_SERVER__', globalGuards: [], globalInterceptors: [], middlewares: [], ...options } as Required<Options>
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
      const { body } = req

      async function errorHandler(e: any) {
        const error = await Context.filter(e)
        return res.status(error.status).json(error)
      }

      if (!Array.isArray(body))
        return errorHandler(new BadRequestException('data format should be an array'))

      try {
        return Promise.all(body.map((item: any) => {
          // eslint-disable-next-line no-async-promise-executor
          return new Promise(async (resolve) => {
            const { tag } = item
            const meta = metaMap.get(tag)
            if (!meta)
              return resolve(await Context.filter(new BadRequestException(`"${tag}" doesn't exist`)))

            const contextData = {
              type: 'express' as const,
              request: req,
              meta,
              response: res,
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
            } = meta

            const instance = moduleMap.get(name)

            try {
              await context.useGuard([...globalGuards, ...guards])
              if (await context.useInterceptor([...globalInterceptors, ...interceptors])
              ) return
              const args = await context.usePipe(params.map(({ type, key, option, index }) => {
                return { arg: item.args[index], type, key, option, index, reflect: paramsType[index] }
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
        paramsType,
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
          type: 'express' as const,
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
            return { arg: resolveDep((req as any)[type], key), option, key, type, index, reflect: paramsType[index] }
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
