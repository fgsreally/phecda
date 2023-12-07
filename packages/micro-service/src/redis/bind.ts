import type Redis from 'ioredis'

import { type Factory, parseMeta } from 'phecda-server'
import { Context } from './context'
export function bind(pub: Redis, sub: Redis, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>) {
  const { route, dev = process.env.NODE_ENV !== 'production' } = { route: '__PHECDA_SERVER__', ...options } as Required<Options>

  function initMetaRecord() {
    Context.metaDataRecord = {}
    for (const i of meta) {
      const { method, tag } = i.data
      const methodTag = `${tag}-${method}`
      Context.metaDataRecord[methodTag] = parseMeta(i)
    }
  }

  function subscribe() {
    sub.subscribe(route)

    sub.on('message', async (str) => {
      const { data, id, route: ClientRoute } = JSON.parse(str as string)

      if (Array.isArray(data)) {
        const context = new Context(route, {
          isMerge: true,
        })

        return Promise.all(data.map((item: any) => {
          // eslint-disable-next-line no-async-promise-executor
          return new Promise(async (resolve) => {
            const { tag, arg } = item
            const [name, method] = tag.split('-')

            const {
              reflect,
              handlers,
              params,
            } = Context.metaDataRecord[tag]
            try {
              const args = await context.usePipe(params.map(({ type, key, option, index }) => {
                return { arg, type, key, option, index, reflect: reflect[index] }
              }), tag) as any
              resolve(await moduleMap.get(name)[method](...args))
            }
            catch (e: any) {
              handlers.forEach(handler => handler.error?.(e))
              resolve(await context.useFilter(e))
            }
          })
        })).then(async (ret) => {
          pub.publish(ClientRoute, JSON.stringify({
            id, data: await context.usePost(ret), route,
          }))
        })
      }
      else {
        const { tag, arg } = data
        const context = new Context(tag, {
          isMerge: false,
        })

        const { params, reflect, handlers } = Context.metaDataRecord[tag]
        try {
          const [name, method] = tag.split('-')

          const args = await context.usePipe(params.map(({ type, key, option, index }) => {
            return { arg, option, key, type, index, reflect: reflect[index] }
          }), tag)

          pub.publish(ClientRoute, JSON.stringify({
            route,
            id,
            data: await moduleMap.get(name)[method](...args),
          }))
        }
        catch (e) {
          handlers.forEach(handler => handler.error?.(e))
          pub.publish(ClientRoute, JSON.stringify({
            route,
            id,
            data: await context.useFilter(e),
          }))
        }
      }
    })
  }
  initMetaRecord()
  subscribe()

  if (dev) {
    // @ts-expect-error globalThis
    const rawMetaHmr = globalThis.__PS_WRITEMETA__
    // @ts-expect-error globalThis

    globalThis.__PS_WRITEMETA__ = () => {
      initMetaRecord()
      rawMetaHmr?.()
    }
  }
}
