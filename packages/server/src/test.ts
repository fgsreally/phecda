import type { Express, Router } from 'express'

import type { Test } from 'supertest'
import { Factory } from './core'
import type { Construct, PickFunc } from './types'
import { APP_SYMBOL } from './common'

export async function TestFactory<T extends Construct[]>(...Modules: T) {
  const { moduleMap, constructorMap } = await Factory(Modules)

  return {
    get<C extends T[number]>(Module: C): InstanceType<C> {
      const tag = Module.prototype?.__TAG__ || Module.name
      const instance = moduleMap.get(tag)

      if (!instance)
        throw new Error(`module "${tag}" doesn't exist`)

      if (constructorMap.get(tag) !== Module)
        throw new Error(`Module ${Module.name} and "${tag}' in modulemap are different modules`)

      return instance
    },
  }
}

export type SuperTestRequest<T> = {
  [K in keyof T]: T[K] extends (...args: infer R) => any ? (...args: R) => Test : never;
}

export async function TestHttp(app: Router | Express | any) {
  const { moduleMap, meta } = (app as any)[APP_SYMBOL] as Awaited<ReturnType<typeof Factory>>
  const { default: request } = await import('supertest')
  return {
    get<T extends Construct>(Module: T): SuperTestRequest<PickFunc<InstanceType<T>>> {
      const tag = Module.prototype?.__TAG__ || Module.name

      const instance = moduleMap.get(tag)
      if (!instance)
        throw new Error(`module "${tag}" doesn't exist`)

      return new Proxy({}, {
        get(_target, p) {
          const { data } = meta.find(({ data }) => data.name === Module.name && data.method === p && data.tag === tag)!
          return (...args: any) => {
            const ret = { body: {}, headers: {}, query: {}, method: data.http!.type, url: data.http!.route } as any

            data.params.forEach((item) => {
              if (item.type === 'params') {
                ret.url = ret.url.replace(`:${item.key}`, args[item.index])
                return
              }
              if (item.type === 'query') {
                ret.query[item.key] = args[item.index]
                return
              }

              // body
              if (item.key)
                ret[item.type][item.key] = args[item.index]
              else
                ret[item.type] = args[item.index]
            })

            // @ts-expect-error miss type
            return request(app)[ret.method](ret.url).query(ret.query).set(ret.headers).send(ret.body)
            // const res = await request(app)[ret.method](ret.url + ret.query).set({ ...headers, ...ret.headers }).send(ret.body)
            // if (res.type.includes('text'))
            //   return res.text

            // if (res.type.includes('json'))
            //   return res.body
          }
        },
      }) as any
    },
  }
}
