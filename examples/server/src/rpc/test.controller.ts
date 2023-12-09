import { Arg, Rpc } from 'phecda-server'

export class TestRpc {
  @Rpc('redis')
  run(@Arg() arg: string) {
    console.log(`arg is ${arg}`)
    return arg
  }
}
