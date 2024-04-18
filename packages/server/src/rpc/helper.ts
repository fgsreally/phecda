import { hostname } from 'os'

export function genClientQueue() {
  return `PS:${hostname()}-${process.pid}`
}

export interface RpcServerOptions {
  globalGuards?: string[]
  globalInterceptors?: string[]
}

export interface RpcClientOptions {
  // eventName/id prefix
  prefix?: string
  timeout?: number
  max?: number
}
