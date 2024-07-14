import { Base } from 'phecda-core'
import type { HttpContext } from '../server/types'
import type { RpcContext } from '../rpc/types'
import { Ctx } from '../decorators'
import { emitter } from '../core'

export class ServerBase extends Base {
  emitter = emitter
}

export class HttpBase extends ServerBase {
  @Ctx
  context: HttpContext
}
export class RpcBase extends ServerBase {
  @Ctx
  context: RpcContext
}
