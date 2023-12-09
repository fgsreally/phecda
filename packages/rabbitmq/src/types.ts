import type amqplib from 'amqplib'
import type { Exception } from 'phecda-server'
export type MQFilter<E extends Exception = any> = (err: E | Error, contextData: any) => any

export interface MqCtx {
  content?: string
  message?: any
  channel?: amqplib.Channel
}
