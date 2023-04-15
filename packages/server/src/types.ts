export interface ServerMeta {
  route: {
    type: string
    route: string
  }
  params: { type: string; index: number; key: string }[]
  guards?: string[]
  interceptor?: string[]
  method: string
  name: string
}
