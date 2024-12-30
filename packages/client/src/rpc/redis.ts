import type Redis from 'ioredis'

import { RpcAdapter } from './client'

export function RedisAdaptor({ pub, sub }: { pub: Redis; sub: Redis }): RpcAdapter {
  return async ({ clientQueue, receive }) => {
    await sub.subscribe(clientQueue)
    sub.on('message', async (channel, msg) => {
      if (channel === clientQueue && msg)
        receive(JSON.parse(msg))
    })
    return {
      send: ({ data, queue }) => {
        pub.publish(queue, JSON.stringify(data))
      },
    }
  }
}
