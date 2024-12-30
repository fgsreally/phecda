import type { NatsConnection } from 'nats'
import { RpcAdapter } from './client'
export function NatsAdaptor(nc: NatsConnection): RpcAdapter {
  return async ({ receive }) => {
    const { StringCodec } = await import('nats')
    const sc = StringCodec()

    return {
      send: ({ data, queue, reject }) => {
        const request = nc.request(queue, sc.encode(JSON.stringify(data)))
        request.catch(reject)
        request
          .then((msg) => {
            receive(msg.json())
          })
      },
    }
  }
}
