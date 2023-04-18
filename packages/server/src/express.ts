/* eslint-disable no-ex-assign */
import type { Express } from 'express'
import { Pcontext, parseMeta } from './context'
import { HttpException } from './exception/base'
import { isObject } from './utils'
import type { Pmeta } from './meta'
import { UndefinedException } from './exception'
import { NotFoundException } from './exception/not-found'
export function bindApp(app: Express, { meta, moduleMap }: { meta: Pmeta[]; moduleMap: any }, key = '/__PHECDA_SERVER__') {
  const methodMap = {} as Record<string, (...args: any[]) => any>
  for (const i of meta) {
    const { name, method, route, header } = i.data
    const instance = moduleMap.get(name)!
    const tag = `${name}-${method}`

    const {
      guards,
      reflect,
      interceptors,
      params,
    } = Pcontext.metaRecord[tag] = parseMeta(i)

    const handler = instance[method].bind(instance)
    methodMap[tag] = handler
    if (route) {
      app[route.type](route.route, async (req, res) => {
        try {
          const context = new Pcontext(`${name}-${method}`, req)
          instance.ctx = context
          instance.request = req
          for (const name in header)
            res.set(name, header[name])
          await context.useGuard(guards)
          await context.useInterceptor(interceptors)
          const args = await context.usePipe(params.map(({ type, key, validate }) => {
            return { arg: (req as any)[type]?.[key], validate }
          }), reflect)
          const ret = await context.usePost(await handler(...args))
          if (isObject(ret))
            res.json(ret)
          else
            res.send(String(ret))
        }
        catch (e: any) {
          if (!(e instanceof HttpException))
            e = new UndefinedException(e.message || e)

          res.status(e.status).json(e.data)
        }
      })
    }
  }
  app.post(key, async (req, res) => {
    const context = new Pcontext(key, req)
    const ret = [] as any[]
    try {
      const { body } = req

      for (const i in body) {
        const {
          guards,
          reflect,
          interceptors,
          params,
        } = Pcontext.metaRecord[i]
        const [name] = i.split('-')
        const instance = moduleMap.get(name)
        instance.ctx = context
        instance.request = req
        if (!params)
          throw new NotFoundException(`"${i}" doesn't exist`)

        await context.useGuard(guards)
        await context.useInterceptor(interceptors)
        const args = await context.usePipe(params.map(({ type, key, validate }) => {
          return { arg: body[i][type]?.[key], validate }
        }), reflect)

        const ret = await context.usePost(await methodMap[i](...args))

        ret.push(ret)
      }
    }
    catch (e: any) {
      if (!(e instanceof HttpException))
        e = new UndefinedException(e.message || e)
      ret.push(e.data)
    }
    res.json(ret)
  })
}
