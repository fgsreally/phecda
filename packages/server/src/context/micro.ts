import type { ValidatePipe } from '../pipe'
import { defaultPipe } from '../pipe'
import type { ErrorFilter } from '../filter'
import { rabbitMqFilter } from '../filter'
import { WrongMetaException } from '../exception/wrong-meta'
import { Pcontext } from './base'

export class RabbitMqContext extends Pcontext {
  static pipe = defaultPipe
  static filter = rabbitMqFilter
  static middlewareRecord: Record<string, (...params: any) => boolean> = {}
  static useMiddleware(middlewares: string[]) {
    return middlewares.map((m) => {
      if (!(m in RabbitMqContext.middlewareRecord))
        throw new WrongMetaException(`can't find middleware named ${m}`)
      return RabbitMqContext.middlewareRecord[m]
    })
  }

  async usePipe(args: { arg: any; validate?: boolean }[], reflect: any[]) {
    return RabbitMqContext.pipe.transform?.(args, reflect)
  }

  useFilter(arg: any) {
    return RabbitMqContext.filter(arg, this.data)
  }
}
export function useMqPipe(pipe: ValidatePipe) {
  RabbitMqContext.pipe = pipe
}
export function useMqFilter(filter: ErrorFilter) {
  RabbitMqContext.filter = filter
}