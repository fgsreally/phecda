import type { RequestHandler } from 'express'
import { defaultPipe } from '../pipe'
import { serverFilter } from '../filter'
import { FrameworkException } from '../exception'
import type { P, ServerCtx, ServerFilter, ServerMergeCtx } from '../types'
import { Context } from './base'

export class ServerContext extends Context<ServerCtx | ServerMergeCtx > {
  static pipe = defaultPipe
  static filter = serverFilter
  static middlewareRecord: Record<string, (...params: any) => any> = {}
  static useMiddleware(middlewares: string[]) {
    return middlewares.map((m) => {
      if (!(m in ServerContext.middlewareRecord))
        throw new FrameworkException(`can't find middleware named ${m}`)
      return ServerContext.middlewareRecord[m]
    })
  }

  async usePipe(args: { arg: any; option?: any; type: string;key: string;index: number; reflect: any }[], tag: string) {
    return ServerContext.pipe.transform?.(args, tag, this.data)
  }

  static useFilter(arg: any, data: ServerCtx | ServerMergeCtx) {
    return ServerContext.filter(arg, data)
  }

  useFilter(arg: any) {
    return ServerContext.filter(arg, this.data)
  }
}

export function addMiddleware(key: string, handler: RequestHandler) {
  ServerContext.middlewareRecord[key] = handler
}

export function useServerPipe(pipe: P.Pipe) {
  ServerContext.pipe = pipe
}
export function useServerFilter(filter: ServerFilter) {
  ServerContext.filter = filter
}
