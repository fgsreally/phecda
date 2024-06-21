import { IncomingHttpHeaders } from 'node:http'
import { BaseContext, DefaultOptions } from '../types'
export interface HttpOptions extends DefaultOptions {

  /**
   * 专用路由的值，默认为/__PHECDA_SERVER__，处理phecda-client发出的合并请求
   */
  parallelRoute?: string | false

  /**
   * 专用路由的插件(work for merge request)，
   */
  parallelPlugins?: string[]

  /**
     *  only work for http server
     */
  globalPlugins?: string[]

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
