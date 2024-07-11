import type { Server } from 'node:http'
import type { SuperAgentTest, Test } from 'supertest'
import { type Construct, getTag } from 'phecda-core'
import { Factory } from './core'

import type { PickFunc } from './types'
import type { ControllerMeta } from './meta'
export async function TestFactory<T extends Construct[]>(...Modules: T) {
  const { moduleMap, modelMap } = await Factory(Modules)

  return {
    get<C extends T[number]>(Model: C): InstanceType<C> {
      const tag = getTag(Model)
      const module = moduleMap.get(tag)

      if (!module)
        throw new Error(`module "${String(tag)}" doesn't exist`)

      if (modelMap.get(module) !== Model)
        throw new Error(`module "${Model.name}" and "${String(tag)}" in modulemap are different modules`)

      return module
    },
  }
}

export type SuperTestRequest<T> = {
  [K in keyof T]: T[K] extends (...args: infer R) => any ? (...args: R) => Test : never;
}

export async function TestHttp(app: Server | any, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, isAgent = true) {
  const { default: request, agent } = await import('supertest')
  const Agent = agent(app) as SuperAgentTest & { module: typeof module }

  function module<T extends Construct>(Module: T): SuperTestRequest<PickFunc<InstanceType<T>>> {
    const tag = getTag(Module)

    const module = moduleMap.get(tag)
    if (!module)
      throw new Error(`module "${String(tag)}" doesn't exist`)

    return new Proxy({}, {
      get(_target, p) {
        const { data } = (meta as ControllerMeta[]).find(({ data }) => data.name === Module.name && data.func === p && data.tag === tag)!
        return (...args: any) => {
          const ret = { body: {}, headers: {}, query: {}, func: data.http!.type, url: data.http!.prefix + data.http!.route } as any

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
          // @ts-expect-error @todo miss type
          let agent = (isAgent ? Agent : request(app))[ret.func](ret.url)
          if (Object.keys(ret.query).length > 0)
            agent = agent.query(ret.query)

          if (Object.keys(ret.headers).length > 0)
            agent = agent.set(ret.headers)

          if (Object.keys(ret.body).length > 0)
            agent = agent.send(ret.body)

          return agent
        }
      },
    }) as any
  }

  Agent.module = module

  return Agent
}
