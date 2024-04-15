/* eslint-disable no-console */
import { Arg, Queue, Rpc } from 'phecda-server'

@Rpc()
export class TestRpc {
  run(@Arg() arg: string) {
    console.log(`arg is ${arg}`)
    return arg
  }

  @Queue('test')
  @Rpc(true)
  event(@Arg() arg: string) {
    console.log(`arg is ${arg}`)
  }
}
