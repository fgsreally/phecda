import type { BaseRequestType } from './types'

export interface ServiceMetaData {
  func: string
  name: string
  tag: string
  define?: any
  [key: string]: any
}

export interface ControllerMetaData extends ServiceMetaData {
  controller: string
  http?: {
    type: BaseRequestType
    prefix: string
    route: string
    headers?: Record<string, string>

  }
  rpc?: {
    queue?: string
    isEvent?: boolean
  }
  ctx?: string
  params: { type: string; index: number; key: string; pipe?: string; define: Record<string, any> }[]
  guards: string[]
  pipe?: string
  filter?: string
  interceptors: string[]
  plugins: string[]

}

export type MetaData = ControllerMetaData | ServiceMetaData

export class Meta {
  constructor(public data: MetaData, public paramsType: any[]) {

  }
}

export interface ControllerMeta extends Meta {
  data: ControllerMetaData
}
