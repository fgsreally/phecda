/* eslint-disable no-console */
import { Arg, Queue, type RpcContext } from 'phecda-server'

@Rpc()
export class TestRpc {
  @Ctx

  context: RpcContext

  @Queue()
  run(@Arg arg: string) {
    console.log(`arg is ${arg}`)
    return arg
  }

  @Queue('test', true)
  event(@Arg arg: string) {
    console.log(`arg is ${arg}`)
  }
}
