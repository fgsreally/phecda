import type { Express, Router } from 'express'
import { Factory } from './core'
import type { Construct } from './types'
import { APP_SYMBOL } from './common'

export async function TestFactory<T extends Construct[]>(...Modules: T) {
  const { moduleMap, constructorMap } = await Factory(Modules, {
    file: '',
    dev: false,
  })

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

export async function TestHttp(app: Express | Router, headers: Record<string, string> = {}) {
  const { moduleMap, meta } = (app as any)[APP_SYMBOL] as Awaited<ReturnType<typeof Factory>>
  const { default: request } = await import('supertest')
  return {
    get<T extends Construct>(Module: T): InstanceType<T> {
      const tag = Module.prototype?.__TAG__ || Module.name

      const instance = moduleMap.get(tag)
      if (!instance)
        throw new Error(`module "${tag}" doesn't exist`)

      return new Proxy({}, {
        get(_target, p) {
          const { data } = meta.find(({ data }) => data.name === Module.name && data.method === p && data.tag === tag)!
          return (...args: any) => {
            const ret = { body: {}, headers: {}, query: {}, params: {}, realParam: '', method: data.route!.type, url: data.route!.route }

            data.params.forEach((item) => {
              if (item.type === 'params') {
                ret.realParam += `/${args[item.index]}`
                return
              }
              if (item.key)
              // @ts-expect-error miss
                ret[item.type][item.key] = args[item.index]
              else
              // @ts-expect-error miss
                ret[item.type] = args[item.index]
            })

            return request(app)[ret.method](ret.url + ret.realParam).set({ ...headers, ...ret.headers }).send(ret.body)
          }
        },
      }) as any
    },
  }
}
