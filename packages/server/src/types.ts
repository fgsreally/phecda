export interface ServerMeta {
  route: {
    type: RequestType
    route: string
  }
  params: { type: string; index: number; key: string }[]
  guards?: string[]
  interceptor?: string[]
  method: string
  name: string
}

export type RequestType = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'

export type MergeType = <R extends Promise<any>[]> (...args: R) => { [K in keyof R]: Awaited<R[K]> }
