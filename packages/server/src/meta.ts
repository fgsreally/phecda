import type { BaseRequestType } from './types'

export interface ServiceMetaData {
  func: string
  name: string
  tag: string
  define?: any
  rawMeta: any,
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
  ctxs?: string[]
  params: { type: string; index: number; key: string; pipe?: string; define: Record<string, any>, rawMeta: any }[]
  guards: string[]
  pipe?: string
  filter?: string
  addons: string[]

}

export type MetaData = ControllerMetaData | ServiceMetaData

export class Meta {
  constructor(public data: MetaData, public paramsType: any[]) {

  }
}

export interface ControllerMeta extends Meta {
  data: ControllerMetaData
}
