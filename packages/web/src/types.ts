import type { Events } from 'phecda-core'

export interface PhecdaEmitter {
  on<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  off<N extends keyof Events>(eventName: N, cb?: (args: Events[N]) => void): void
  emit<N extends keyof Events>(eventName: N, param: Events[N]): void
}

export type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> }
