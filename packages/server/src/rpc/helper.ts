import { hostname } from 'os'
import { BaseContext, DefaultOptions } from '../types'

export function genClientQueue(key?: string) {
  return `PS-${key ? `${key}-` : ''}${hostname()}-${process.pid}`
}

export interface RpcServerOptions extends DefaultOptions {

}

export interface RpcClientOptions {
  // add to clientQueue
  key?: string
  timeout?: number
  max?: number
}
export interface RpcContext extends BaseContext {
  args: any[]
  id: string
  queue: string
  isEvent?: boolean
}
