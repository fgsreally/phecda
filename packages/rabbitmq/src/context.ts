import type { P } from 'phecda-server'
import { Context, FrameworkException, defaultPipe } from 'phecda-server'
import { rabbitMqFilter } from './filter'
import type { MQFilter } from './types'

export class RabbitMqContext extends Context {
  static pipe = defaultPipe
  static filter = rabbitMqFilter
  static middlewareRecord: Record<string, (...params: any) => boolean> = {}

  /**
   * @deprecated it seems useless
   */
  static useMiddleware(middlewares: string[]) {
    return middlewares.map((m) => {
      if (!(m in RabbitMqContext.middlewareRecord))
        throw new FrameworkException(`can't find middleware named ${m}`)
      return RabbitMqContext.middlewareRecord[m]
    })
  }

  async usePipe(args: { arg: any; validate?: boolean }[], reflect: any[]) {
    return RabbitMqContext.pipe.transform?.(args, reflect, this.data)
  }

  static useFilter(arg: any, data: MQFilter) {
    return RabbitMqContext.filter(arg, data)
  }

  useFilter(arg: any) {
    return RabbitMqContext.filter(arg, this.data)
  }
}
export function useMqPipe(pipe: P.Pipe) {
  RabbitMqContext.pipe = pipe
}
export function useMqFilter(filter: MQFilter) {
  RabbitMqContext.filter = filter
}
