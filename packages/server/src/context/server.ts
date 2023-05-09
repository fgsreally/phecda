import type { ValidatePipe } from '../pipe'
import { defaultPipe } from '../pipe'
import type { ErrorFilter } from '../filter'
import { serverFilter } from '../filter'
import { WrongMetaException } from '../exception/wrong-meta'
import { Pcontext } from './base'

export class ServerContext extends Pcontext {
  static pipe = defaultPipe
  static filter = serverFilter
  static middlewareRecord: Record<string, (...params: any) => any> = {}
  static useMiddleware(middlewares: string[]) {
    return middlewares.map((m) => {
      if (!(m in ServerContext.middlewareRecord))
        throw new WrongMetaException(`can't find middleware named ${m}`)
      return ServerContext.middlewareRecord[m]
    })
  }

  async usePipe(args: { arg: any; validate?: boolean }[], reflect: any[]) {
    return ServerContext.pipe.transform?.(args, reflect)
  }

  useFilter(arg: any) {
    return ServerContext.filter(arg, this.data)
  }
}

export function addMiddleware(key: string, handler: (...params: any) => any) {
  ServerContext.middlewareRecord[key] = handler
}

export function useServerPipe(pipe: ValidatePipe) {
  ServerContext.pipe = pipe
}
export function useServerFilter(filter: ErrorFilter) {
  ServerContext.filter = filter
}
