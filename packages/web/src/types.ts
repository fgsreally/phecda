import type { Events } from 'phecda-core'

export interface ActiveInstance {
  state: Record<string, any>
  _v: WeakMap<any, any>
  _r: WeakMap<any, any>
  _f: WeakMap<any, any>
  _c: WeakMap<any, any>
  [key: string]: any
}

export interface PhecdaEmitter {
  on<N extends keyof Events>(eventName: N, cb: (args: Events[N]) => void): void
  off<N extends keyof Events>(eventName: N, cb?: (args: Events[N]) => void): void
  emit<N extends keyof Events>(eventName: N, param: Events[N]): void
}

export interface Plugin {
  setup(instance: ActiveInstance): void
  unmount?(instance: ActiveInstance): void
}