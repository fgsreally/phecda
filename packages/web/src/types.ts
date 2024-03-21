import type { Events } from 'phecda-core'

export interface ActiveInstance {
  state: Record<string | symbol, any>
  origin: WeakMap<any, any>
  cache: WeakMap<any, any>

  [key: string]: any
}

export interface PhecdaEmitter {
  on<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  off<N extends keyof Events>(eventName: N, cb?: (args: Events[N]) => void): void
  emit<N extends keyof Events>(eventName: N, param: Events[N]): void
}
