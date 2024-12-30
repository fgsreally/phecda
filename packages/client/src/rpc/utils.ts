import { hostname } from 'os'

export function genClientQueue(key?: string) {
  return `PS-${key ? `${key}-` : ''}${hostname()}-${process.pid}`
}

export interface RpcClientOptions {
  // add to clientQueue
  key?: string
  timeout?: number
  max?: number
}
