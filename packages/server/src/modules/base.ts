import { Base } from 'phecda-core'
import { type LogLevel, log } from '../../src/utils'
import type { HttpCtx } from '../http/types'
import type { RpcCtx } from '../rpc/types'
import { Ctx } from '../decorators'
import { emitter } from '../core'

export class ServerBase extends Base {
  emitter = emitter

  protected log(msg: unknown, level: LogLevel = 'log') {
    log(msg, level, this.tag)
  }
}

export class HttpBase<Ctx extends HttpCtx = HttpCtx> extends ServerBase {
  @Ctx
  context: Ctx
}
export class RpcBase<Ctx extends RpcCtx = RpcCtx> extends ServerBase {
  @Ctx
  context: Ctx
}
