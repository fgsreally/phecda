import type { Codec, NatsConnection } from 'nats'
import { RpcAdapter } from './client'
export function adaptor(nc: NatsConnection): RpcAdapter {
  return ({ receive }) => {
    let sc: Codec<string>

    return {
      async init() {
        const { StringCodec } = await import('nats')
        sc = StringCodec()
      },
      send: ({ data, queue, reject }) => {
        const request = nc.request(queue, sc.encode(JSON.stringify(data)))
        request.catch(reject)
        request
          .then((msg) => {
            const { data, error } = msg.json() as any
            if (error)
              reject(data)

            else
              receive(data)
          })

        return true
      },
    }
  }
}
