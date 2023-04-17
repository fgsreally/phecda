import type { Express } from 'express'
import { Pserver } from './server'
import { HttpException } from './exception/base'
import { isObject } from './utils'
import type { Meta } from './meta'
export function bindApp(app: Express, { meta, moduleMap }: { meta: Meta[]; moduleMap: any }, key = '/__PHECDA_SERVER__') {
  const methodMap = {} as Record<string, (...args: any[]) => any>
  for (const i of meta) {
    const { name, method, route, header } = i.data
    const server = new Pserver(`${name}`, i)
    const instance = moduleMap.get(name)!
    const handler = server.methodToHandler(instance[method].bind(instance))
    methodMap[`${name}-${method}`] = handler
    if (route) {
      app[route.type](route.route, async (req, res) => {
        instance.request = req
        instance.meta = req.body

        const ret = await handler(req)
        for (const name in header)
          res.set(name, header[name])

        if (ret instanceof HttpException) {
          res.status(ret.status).json(ret.data)

          return
        }
        if (isObject(ret))
          res.json(ret)
        else
          res.send(String(ret))
      })
    }
  }
  app.post(key, async (req, res) => {
    const { body } = req
    const ret = [] as any[]
    for (const i in body) {
      const res = await methodMap[i](body[i])
      ret.push(ret instanceof HttpException ? res.data : res)
    }

    res.json(ret)
  })
}
