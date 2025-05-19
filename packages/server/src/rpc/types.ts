import { BaseCtx, DefaultOptions } from '../types'

export interface RpcServerOptions extends DefaultOptions {
  defaultQueue?: string
}

export interface RpcCtx extends BaseCtx {
  args: any[]
  id: string
  queue: string
  isEvent?: boolean
  category: 'rpc'
}
