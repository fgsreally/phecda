import type amqplib from 'amqplib'

import type { Pmeta } from '../meta'
import { parseMeta } from '../context'
import { resolveDep } from '../utils'

export async function bindMQ(ch: amqplib.Channel, { meta, moduleMap }: { meta: Pmeta[]; moduleMap: any }) {
  for (const item of meta) {
    const { route, name, method } = item.data
    const {
      params,
    } = parseMeta(item)
    if (route) {
      await ch.assertQueue(route.route)
      ch.consume(route.route, (msg) => {
        if (msg !== null) {
          ch.ack(msg)
          const data = JSON.parse(msg.content.toString())
          moduleMap.get(name)[method](...params.map(({ key, validate }) => {
            return { arg: resolveDep(data, key), validate }
          }))
        }
        else {
          // console.log('Consumer cancelled by server')
        }
      })
    }
  }
}
