import { Base } from 'phecda-core'
import { type LogLevel, log } from '../../src/utils'
import type { HttpContext } from '../http/types'
import type { RpcContext } from '../rpc/types'
import { Ctx } from '../decorators'
import { emitter } from '../core'

export class ServerBase extends Base {
  emitter = emitter

  log(msg: string, level: LogLevel) {
    log(msg, level, this.tag)
  }
}

export class HttpBase extends ServerBase {
  @Ctx
  context: HttpContext
}
export class RpcBase extends ServerBase {
  @Ctx
  context: RpcContext
}
