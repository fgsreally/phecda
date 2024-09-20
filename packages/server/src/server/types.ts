import { IncomingHttpHeaders,  IncomingMessage, ServerResponse } from 'node:http'
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
  redirect: (url: string, status?: number) => void
  getCookie(key: string): string | undefined
  setCookie(key: string, value: string, opts?: CookieSerializeOptions): void
  delCookie(key: string): void
  setResHeaders: (headers: Record<string, string>) => void
  setResStatus: (status: number) => void
  getRequest: () => IncomingMessage
  getResponse: () => ServerResponse,
}

// from cookie-es
export interface CookieSerializeOptions {

  domain?: string | undefined

  encode?(value: string): string

  expires?: Date | undefined

  httpOnly?: boolean | undefined

  maxAge?: number | undefined

  path?: string | undefined

  priority?: 'low' | 'medium' | 'high' | undefined

  sameSite?: true | false | 'lax' | 'strict' | 'none' | undefined

  secure?: boolean | undefined

  partitioned?: boolean
}
