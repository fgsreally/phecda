import type { Express } from 'express'
import { Pcontext, ServerContext, parseMeta } from '../context'
import { isObject, resolveDep } from '../utils'
import { MERGE_SYMBOL, SERIES_SYMBOL } from '../common'
import type { Factory } from '../core'
import { BadRequestException } from '../exception'
import type { Pmeta } from '../meta'
import type { ServerMergeCtx } from '../types'

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
 * 专用路由的中间件，全局中间件请在bindApp以外设置
 */
  middlewares?: string[]
}

export function bindApp(app: Express, { meta, moduleMap }: Awaited<ReturnType<typeof Factory>>, options: Options = {}) {
  const { globalGuards, globalInterceptors, route, middlewares: proMiddle } = { route: '/__PHECDA_SERVER__', globalGuards: [], globalInterceptors: [], middlewares: [], ...options } as Required<Options>
  const methodMap = {} as Record<string, (...args: any[]) => any>
  const contextMeta = {} as Record<string, Pmeta>
  for (const i of meta) {
    const { name, method, route, header, tag } = i.data
    const instance = moduleMap.get(tag)!
    const methodTag = `${tag}-${method}`
    contextMeta[methodTag] = i
    Pcontext.metaRecord[methodTag] = i
    let {
      guards,
      reflect,
      interceptors,
      params,
      middlewares,
    } = Pcontext.metaDataRecord[methodTag] ? Pcontext.metaDataRecord[methodTag] : (Pcontext.metaDataRecord[methodTag] = parseMeta(i))

    guards = [...globalGuards!, ...guards]
    interceptors = [...globalInterceptors!, ...interceptors]

    const handler = instance[method].bind(instance)
    methodMap[methodTag] = handler
    Pcontext.instanceRecord[name] = instance
    if (route) {
      app[route.type](route.route, ...ServerContext.useMiddleware(middlewares), async (req, res) => {
        const contextData = {
          request: req,
          meta: i,
          response: res,
        }
        const context = new ServerContext(methodTag, contextData)

        try {
          for (const name in header)
            res.set(name, header[name])
          await context.useGuard(guards)
          await context.useInterceptor(interceptors)
          const args = await context.usePipe(params.map(({ type, key, validate }) => {
            return { arg: resolveDep((req as any)[type], key), validate }
          }), reflect)
          instance.context = contextData

          const ret = await context.usePost(await handler(...args))
          if (isObject(ret))
            res.json(ret)
          else
            res.send(String(ret))
        }
        catch (e: any) {
          i.handlers.forEach(handler => handler.error?.(e))
          const err = await context.useFilter(e)
          res.status(err.status).json(err)
        }
      })
    }
  }

  app.post(route, (req, _res, next) => {
    (req as any)[MERGE_SYMBOL] = true
    next()
  }, ...ServerContext.useMiddleware(proMiddle), async (req, res) => {
    const { body: { category, data } } = req

    const contextData = {
      request: req,
      response: res,
      meta: contextMeta,
    } as unknown as ServerMergeCtx

    if (!Array.isArray(data))
      return res.json(await ServerContext.useFilter(new BadRequestException('data format should be an array'), contextData))

    contextData.tags = data.map((item: any) => item.tag)

    const context = new ServerContext(route, contextData)
    const ret = [] as any[]

    if (category === 'series') {
      for (const item of data) {
        const { tag } = item
        const [name] = tag.split('-')
        const {
          guards,
          reflect,
          interceptors,
          params,
        } = Pcontext.metaDataRecord[tag]
        const instance = moduleMap.get(name)

        try {
          if (!params)
            throw new BadRequestException(`"${tag}" doesn't exist`)

          await context.useGuard(guards, true)
          await context.useInterceptor(interceptors, true)
          const args = await context.usePipe(params.map(({ type, key, validate }) => {
            const arg = resolveDep(item[type], key)
            if (typeof arg === 'string' && arg.startsWith(SERIES_SYMBOL)) {
              const [, index, argKey] = arg.split('@')
              return { arg: resolveDep(ret[Number(index)], argKey || key), validate }
            }

            return { arg, validate }
          }), reflect) as any
          instance.context = contextData

          ret.push(await context.usePost(await methodMap[tag](...args)))
        }
        catch (e: any) {
          const m = Pcontext.metaRecord[tag]
          m.handlers.forEach(handler => handler.error?.(e))
          ret.push(await context.useFilter(e))
        }
      }
      return res.json(ret)
    }
    if (category === 'parallel') {
      return Promise.all(data.map((item: any) => {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve) => {
          const { tag } = item
          const [name] = tag.split('-')
          const {
            guards,
            reflect,
            interceptors,
            params,
          } = Pcontext.metaDataRecord[tag]
          const instance = moduleMap.get(name)

          try {
            if (!params)
              throw new BadRequestException(`"${tag}" doesn't exist`)

            await context.useGuard(guards, true)
            await context.useInterceptor(interceptors, true)
            const args = await context.usePipe(params.map(({ type, key, validate }) => {
              const arg = resolveDep(item[type], key)
              return { arg, validate }
            }), reflect) as any
            instance.context = contextData
            resolve(await context.usePost(await methodMap[tag](...args)))
          }
          catch (e: any) {
            const m = Pcontext.metaRecord[tag]
            m.handlers.forEach(handler => handler.error?.(e))
            resolve(await context.useFilter(e))
          }
        })
      })).then((ret) => {
        res.json(ret)
      })
    }

    res.json(await context.useFilter(new BadRequestException('category should be \'parallel\' or \'series\'')))
  })
}
