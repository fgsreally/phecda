/* eslint-disable no-console */
import { Arg, Event, Queue } from 'phecda-server'

export class TestRpc {
  @Queue('test2')
  run(@Arg() arg: string) {
    console.log(`arg is ${arg}`)
    return arg
  }

  @Queue('test')
  @Event()
  event(@Arg() arg: string) {
    console.log(`arg is ${arg}`)
  }
}
