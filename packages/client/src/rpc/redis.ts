import type Redis from 'ioredis'

import { RpcAdapter } from './client'

export function adaptor({ pub, sub }: { pub: Redis; sub: Redis }): RpcAdapter {
  return ({ clientQueue, receive }) => {
    return {
      async init() {
        await sub.subscribe(clientQueue)
        sub.on('message', async (channel, msg) => {
          if (channel === clientQueue && msg)
            receive(JSON.parse(msg))
        })
      },
      send: ({ data, queue }) => {
        pub.publish(queue, JSON.stringify(data))
      },
    }
  }
}
