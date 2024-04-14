export function generateReturnQueue(queue: string) {
  return `${queue}/return`
}

export interface RpcOptions {
  globalGuards?: string[]
  globalInterceptors?: string[]
}
