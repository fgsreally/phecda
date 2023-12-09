import type { RequestHandler } from 'express'
import { FrameworkException } from '../exception'
import { defaultPipe } from '../pipe'
import { defaultFilter } from '../filter'
import type { P, ServerCtx, ServerErr } from '../types'

import { BaseContext } from './base'

export const guardsRecord = {} as Record<string, P.Guard<ServerCtx>>

export const interceptorsRecord = {} as Record<string, P.Interceptor<ServerCtx>>

export const middlewareRecord = {} as Record<string, (...params: any) => any>

export const singletonConf = {
  pipe: defaultPipe,
  filter: defaultFilter,
}
export class Context extends BaseContext<ServerCtx> {
  singletonConf = singletonConf
  // static metaRecord: Record<string, Meta> = {}
  // static metaDataRecord: Record<string, ReturnType<typeof parseMeta>> = {}

  static middlewareRecord = middlewareRecord
  guardsRecord = guardsRecord
  interceptorsRecord = interceptorsRecord

  postInterceptors: Function[]

  static useMiddleware(middlewares: string[]) {
    const ret = []
    for (const m of middlewares) {
      if (!(m in Context.middlewareRecord)) {
        if (process.env.PS_STRICT)
          throw new FrameworkException(`can't find middleware named '${m}'`)

        continue
      }
      ret.push(Context.middlewareRecord[m])
    }
    return ret
  }
}

export function addMiddleware(key: string, handler: RequestHandler) {
  middlewareRecord[key] = handler
}

export function setPipe(pipe: P.Pipe<ServerCtx>) {
  singletonConf.pipe = pipe
}

export function setFilter(filter: P.Filter<ServerCtx, ServerErr>) {
  singletonConf.filter = filter
}

export function addGuard(key: string, handler: P.Guard<ServerCtx>) {
  guardsRecord[key] = handler
}

export function addInterceptor(key: string, handler: P.Interceptor<ServerCtx>) {
  interceptorsRecord[key] = handler
}
