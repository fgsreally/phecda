/* eslint-disable no-console */
import { Arg, Queue, type RpcCtx } from 'phecda-server'

@Rpc()
export class TestRpc {
  @Ctx

  context: RpcCtx

  @Queue()
  run(@Arg arg: string) {
    console.log(`[run] arg is ${arg}`)
    return arg
  }

  @Queue('test', true)
  event(@Arg arg: string) {
    console.log(`arg is ${arg}`)
  }
}
