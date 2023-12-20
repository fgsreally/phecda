import { to } from './helper'
import { init, regisHandler, setExposeKey, setIgnoreKey, setModelVar, setState } from './core'
import type { InjectData } from './types'

export function Init(target: any, key: PropertyKey) {
  setModelVar(target, key)

  regisHandler(target, key, {
    async init(instance: any) {
      instance[key]()
    },
  })
}

// bind value
export function Bind(value: any) {
  return (target: any, k: PropertyKey) => {
    setModelVar(target, k)
    setState(target, k, {
      value,
    })
  }
}

export function Rule(rule: RegExp | string | ((arg: any) => Promise<boolean> | boolean | 'ok') | number,
  info: string | ((k: string, tag: string) => string),
  meta?: any) {
  return (obj: any, key: PropertyKey) => {
    setModelVar(obj, key)
    regisHandler(obj, key, {
      rule,
      info,
      meta,
    })
  }
}

export function Ignore(target: any, key: PropertyKey) {
  setIgnoreKey(target, key)
}

export function Clear(target: any, key: PropertyKey) {
  init(target)

  target._namespace.__INIT_EVENT__.delete(key)
  target._namespace.__EXPOSE_VAR__.delete(key)
  target._namespace.__IGNORE_VAR__.delete(key)
  target._namespace.__STATE_VAR__.delete(key)
  target._namespace.__STATE_HANDLER__.delete(key)
  target._namespace.__STATE_NAMESPACE__.delete(key)
}

export function Err<Fn extends (...args: any) => any>(cb: Fn) {
  return (target: any, key: PropertyKey) => {
    setModelVar(target, key)
    regisHandler(target, key, {
      error: cb,
    })
  }
}

export function Expose(target: any, key: PropertyKey) {
  setExposeKey(target, key)
}

export function Pipe<T extends (arg: any) => any>(cb: T) {
  return (obj: any, key: PropertyKey) => {
    setModelVar(obj, key)
    regisHandler(obj, key, {
      async pipe(instance: any) {
        instance[key] = await cb(instance[key], instance)
      },
    })
  }
}

export function Tag(tag: string) {
  return (target: any) => {
    init(target.prototype)

    target.prototype.__TAG__ = tag
  }
}
// async assign value to instance
export function Assign(cb: (instance?: any) => any) {
  return (target: any) => {
    init(target.prototype)
    setModelVar(target.prototype, '__CLASS')
    regisHandler(target.prototype, '__CLASS', {
      init: async (instance: any) => {
        const value = await cb(instance)
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          for (const i in value)
            instance[i] = value[i]
        }
      },
    })
  }
}

export function Global(target: any) {
  init(target.prototype)
  setModelVar(target.prototype, '__CLASS')
  regisHandler(target.prototype, '__CLASS', {
    init: async (instance: any) => {
      const tag = instance.__TAG__
      if (!tag)
        return
      if (!(globalThis as any).__PHECDA__)
        (globalThis as any).__PHECDA__ = {};
      (globalThis as any).__PHECDA__[tag] = instance.constructor
    },
  })
}

export function Empty(_target: any) {
  init(_target.prototype)
}

export const DataMap = {} as InjectData

export function Provide<K extends keyof InjectData>(key: K, value: InjectData[K]) {
  DataMap[key] = value
}

const EmptyProxy: any = new Proxy(Empty, {
  apply() {
    return EmptyProxy
  },
})
export function Inject<K extends keyof InjectData>(key: K): InjectData[K] {
  return DataMap[key] || EmptyProxy/** work for @Inject(x)(...) */
}

export function Ref<T>(Model: Construct<T>, info: string | ((k: string, tag: string) => string)) {
  return (target: any, v: any) => {
    Rule(async (v: any) => {
      const { err } = await plainToClass(Model, v, { transform: false })
      return err.length === 0
    }, info)(target, v)

    Pipe(to(async (v: any) => {
      const { data } = await plainToClass(Model, v, { collectError: false })
      return data
    }))(target, v)
  }
}
