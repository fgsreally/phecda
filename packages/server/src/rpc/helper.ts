import { hostname } from 'os'

export function genClientQueue(key?: string) {
  return `PS:${key || ''}-${hostname()}-${process.pid}`
}

export interface RpcServerOptions {
  globalGuards?: string[]
  globalInterceptors?: string[]
}

export interface RpcClientOptions {
  // add to clientQueue
  key?: string
  timeout?: number
  max?: number
}
