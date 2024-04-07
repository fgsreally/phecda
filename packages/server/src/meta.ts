import type { P } from './types'

export interface MetaData {
  http?: {
    type: P.RequestType
    route: string
  }
  rpc?: {
    type: string[]
    isEvent: boolean
  }
  ctx?: string
  define?: any
  header: Record<string, string>
  params: { type: string; index: number; key: string; pipe?: string; pipeOpts?: any }[]
  guards: string[]
  filter?: string
  interceptors: string[]
  plugins: string[]
  method: string
  name: string
  tag: PropertyKey
}

export class Meta {
  constructor(public data: MetaData, public paramsType: any[]) {

  }
}
