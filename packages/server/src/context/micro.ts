import type { ValidatePipe } from '../pipe'
import { defaultPipe } from '../pipe'
import type { MQFilter } from '../filter'
import { rabbitMqFilter } from '../filter'
import { FrameworkException } from '../exception'
import { Context } from './base'

export class RabbitMqContext extends Context {
  static pipe = defaultPipe
  static filter = rabbitMqFilter
  static middlewareRecord: Record<string, (...params: any) => boolean> = {}
  static useMiddleware(middlewares: string[]) {
    return middlewares.map((m) => {
      if (!(m in RabbitMqContext.middlewareRecord))
        throw new FrameworkException(`can't find middleware named ${m}`)
      return RabbitMqContext.middlewareRecord[m]
    })
  }

  async usePipe(args: { arg: any; validate?: boolean }[], reflect: any[]) {
    return RabbitMqContext.pipe.transform?.(args, reflect)
  }

  static useFilter(arg: any, data: MQFilter) {
    return RabbitMqContext.filter(arg, data)
  }

  useFilter(arg: any) {
    return RabbitMqContext.filter(arg, this.data)
  }
}
export function useMqPipe(pipe: ValidatePipe) {
  RabbitMqContext.pipe = pipe
}
export function useMqFilter(filter: MQFilter) {
  RabbitMqContext.filter = filter
}
