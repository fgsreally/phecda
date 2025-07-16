import type { Construct } from 'phecda-core'
import type { BaseRequestMethod } from './types'

export interface ServiceMetaData {
  method: string
  name: string
  tag: string
  define?: any
  meta: any
  [key: string]: any
}

export interface ControllerMetaData extends ServiceMetaData {
  controller: string
  http?: {
    method: BaseRequestMethod
    prefix: string
    route: string
    headers?: Record<string, string>
  }
  rpc?: {
    queue?: string
    isEvent?: boolean
  }
  ctxs?: string[]
  params: { type: string; index: number; key: string; pipe?: string; define: Record<string, any>; meta: any }[]
  guards: string[]
  pipe?: string
  filter?: string
  addons: string[]

}

export type MetaData = ControllerMetaData | ServiceMetaData

export class Meta {
  constructor(public data: MetaData, public paramsType: any[], public module: any, public model: Construct) {

  }
}

export interface ControllerMeta extends Meta {
  data: ControllerMetaData
}
