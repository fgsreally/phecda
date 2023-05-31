import type { MQFilter } from './types'

export const rabbitMqFilter: MQFilter = (e: any, data) => {
  const { channel, message } = data
  channel!.reject(message!, true)
}
