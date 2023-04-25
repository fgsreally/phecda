import type { Express } from 'express'
import { Pcontext, ServerContext, parseMeta } from '../context'
import { isObject, resolveDep } from '../utils'
import type { Pmeta } from '../meta'
import { NotFoundException } from '../exception/not-found'
import { REQ_SYMBOL, SERIES_SYMBOL } from '../common'

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

export function bindApp(app: Express, { meta, moduleMap }: { meta: Pmeta[]; moduleMap: any }, options: Options = {}) {
  const { globalGuards, globalInterceptors, route, middlewares: proMiddle } = { route: '/__PHECDA_SERVER__', globalGuards: [], globalInterceptors: [], middlewares: [], ...options } as Required<Options>
  const methodMap = {} as Record<string, (...args: any[]) => any>
  for (const i of meta) {
    const { name, method, route, header } = i.data
    const instance = moduleMap.get(name)!
    const tag = `${name}-${method}`

    Pcontext.metaRecord[tag] = i
    let {
      guards,
      reflect,
      interceptors,
      params,
      middlewares,
    } = Pcontext.metaDataRecord[tag] ? Pcontext.metaDataRecord[tag] : (Pcontext.metaDataRecord[tag] = parseMeta(i))

    guards = [...globalGuards!, ...guards]
    interceptors = [...globalInterceptors!, ...interceptors]

    const handler = instance[method].bind(instance)
    methodMap[tag] = handler
    Pcontext.instanceRecord[name] = instance
    if (route) {
      app[route.type](route.route, ...ServerContext.useMiddleware(middlewares), async (req, res) => {
        const contextData = {
          request: req,
          tag,
          response: res,
        }
        const context = new ServerContext(tag, contextData)

        try {
          for (const name in header)
            res.set(name, header[name])
          await context.useGuard(guards)
          await context.useInterceptor(interceptors)
          const args = await context.usePipe(params.map(({ type, key, validate }) => {
            return { arg: resolveDep((req as any)[type], key), validate }
          }), reflect)
          instance.meta = contextData

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
    (req as any)[REQ_SYMBOL] = true
    next()
  }, ...ServerContext.useMiddleware(proMiddle), async (req, res) => {
    const contextData = {
      request: req,
      response: res,
    }
    const context = new ServerContext(route, contextData)
    const ret = [] as any[]

    const { body } = req

    for (const i in body) {
      const { name: tag } = body[i]
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
          throw new NotFoundException(`"${tag}" doesn't exist`)

        await context.useGuard(guards, true)
        await context.useInterceptor(interceptors)
        const args = await context.usePipe(params.map(({ type, key, validate }) => {
          const arg = resolveDep(body[i][type], key)
          if (typeof arg === 'string' && arg.startsWith(SERIES_SYMBOL)) {
            const [, index, argKey] = arg.split('@')
            return { arg: resolveDep(ret[Number(index)], argKey || key), validate }
          }

          return { arg, validate }
        }), reflect) as any
        instance.meta = contextData

        ret.push(await context.usePost(await methodMap[tag](...args)))
      }
      catch (e: any) {
        const m = Pcontext.metaRecord[tag]
        m.handlers.forEach(handler => handler.error?.(e))
        ret.push(await context.useFilter(e))
      }
    }

    res.json(ret)
  })
}
