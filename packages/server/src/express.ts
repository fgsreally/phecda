import type { Express } from 'express'
import { PhecdaServer } from './server'
import type { ServerMeta } from './types'
import { HttpException } from './exception/base'
import { isObject } from './utils'
export function bindApp(app: Express, { meta, moduleMap }: { meta: ServerMeta[]; moduleMap: any }, key = '/__PHECDA_SERVER__') {
  const methodMap = {} as Record<string, (...args: any[]) => any>
  for (const i of meta) {
    const server = new PhecdaServer(`${i.name}`, i)
    const instance = moduleMap.get(i.name)!
    const method = server.requestToMethod(instance[i.method].bind(instance))
    methodMap[`${i.name}-${i.method}`] = method
    if (i.route.type) {
      app[i.route.type](i.route.route, async (req, res) => {
        const ret = await method(req)
        if (ret instanceof HttpException) {
          res.status(ret.status)
          res.json(ret)
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
    for (const i in body)
      ret.push(await methodMap[i](body[i]))

    res.json(ret)
  })
}
