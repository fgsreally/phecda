import { IncomingHttpHeaders } from 'node:http'
import { BaseContext, DefaultOptions } from '../types'
import type { ControllerMetaData } from '../meta'

export function resolveDep(ret: any, key: string) {
  if (key)
    return ret?.[key]
  return ret
}

export interface HttpOptions extends DefaultOptions {

  /**
 * 专用路由的值，默认为/__PHECDA_SERVER__，处理phecda-client发出的合并请求
 */
  route?: string

  /**
 * 专用路由的插件(work for merge request)，
 */
  plugins?: string[]

}

export interface HttpContext extends BaseContext {
  parallel?: true
  index?: number
  query: Record<string, any>
  params: Record<string, string>
  body: Record<string, any>
  headers: IncomingHttpHeaders
  // redirect:(url:string)=>void

}
export function argToReq(params: ControllerMetaData['params'], args: any[], headers: Record<string, any>) {
  const req = {
    body: {},
    query: {},
    params: {},
    headers,
  } as any

  params.forEach((param) => {
    if (param.key)
      req[param.type][param.key] = args[param.index]

    else
      req[param.type] = args[param.index]
  })

  return req
}
