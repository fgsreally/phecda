import { Base, Empty } from 'phecda-core'
import { Ctx } from 'src/decorators'
import type { HttpContext } from 'src/server/types'
import type { RpcContext } from 'src/rpc/types'
import { emitter } from '../core'

@Empty
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
