import type { Server } from 'node:http'
import type { SuperAgentTest, Test } from 'supertest'
import type { Construct } from 'phecda-core'
import { Factory } from './core'

import type { PickFunc } from './types'
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

export async function TestHttp(app: Server | any, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>) {
  const { default: request, agent } = await import('supertest')

  function module<T extends Construct>(Module: T): SuperTestRequest<PickFunc<InstanceType<T>>> {
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
        }
      },
    }) as any
  }

  const Agent = agent(app) as SuperAgentTest & { module: typeof module }

  Agent.module = module

  return Agent
}
