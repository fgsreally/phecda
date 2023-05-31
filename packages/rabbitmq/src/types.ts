import type amqplib from 'amqplib'
import type { HttpException } from 'phecda-server'
export type MQFilter<E extends HttpException = any> = (err: E | Error, contextData: any) => any

export interface MqCtx {
  content?: string
  message?: any
  channel?: amqplib.Channel
}
