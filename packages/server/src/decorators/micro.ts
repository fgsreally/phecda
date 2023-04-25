import { mergeState, setModalVar } from 'phecda-core'
import type amqplib from 'amqplib'
export function MQ(queue: string, routeKey: string, options?: amqplib.Options.Consume) {
  return (target: any, k: PropertyKey) => {
    setModalVar(target, k)
    mergeState(target, k, {
      mq: {
        queue,
        routeKey,
        options,
      },
    })
  }
}
