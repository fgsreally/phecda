import { BaseContext, DefaultOptions } from '../types'

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
