import type { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify'
import { FrameworkException } from '../../exception'
import { defaultPipe } from '../../pipe'
import { defaultFilter } from '../../filter'
import type { P, ServerErr } from '../../types'

import { BaseContext } from '../../context'
import type { Meta } from '../../meta'

export const guardsRecord = {} as Record<string, P.Guard<FastifyCtx>>

export const interceptorsRecord = {} as Record<string, P.Interceptor<FastifyCtx>>

export const middlewareRecord = {} as Record<string, (...params: any) => any>

export const singletonConf = {
  pipe: defaultPipe,
  filter: defaultFilter,
}

export interface FastifyCtx {
  type: string
  request: FastifyRequest
  response: FastifyReply
  meta: Meta
  moduleMap: Record<string, any>
}
export class Context extends BaseContext<FastifyCtx> {
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

export function addMiddleware(key: string, handler: RouteHandlerMethod) {
  middlewareRecord[key] = handler
}

export function setPipe(pipe: P.Pipe<FastifyCtx>) {
  singletonConf.pipe = pipe
}

export function setFilter(filter: P.Filter<FastifyCtx, ServerErr>) {
  singletonConf.filter = filter
}

export function addGuard(key: string, handler: P.Guard<FastifyCtx>) {
  guardsRecord[key] = handler
}

export function addInterceptor(key: string, handler: P.Interceptor<FastifyCtx>) {
  interceptorsRecord[key] = handler
}
