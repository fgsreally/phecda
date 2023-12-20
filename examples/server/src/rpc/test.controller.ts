import { Arg, Event, Rpc } from 'phecda-server'

@Rpc('redis', 'mq')
export class TestRpc {
  run(@Arg() arg: string) {
    console.log(`arg is ${arg}`)
    return arg
  }

  @Event()
  event(@Arg() arg: string) {
    console.log(`arg is ${arg}`)
  }
}
