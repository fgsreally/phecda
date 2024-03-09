import { plainToClass, transformClass } from './helper'
import { SHARE_KEY, init, regisHandler, setExposeKey, setIgnoreKey, setState, setVar } from './core'
import type { InjectData } from './types'

export function Init(proto: any, key: PropertyKey) {
  setVar(proto, key)

  regisHandler(proto, key, {
    async init(instance: any) {
      return instance[key]()
    },
  })
}

// bind value
export function Bind(value: any) {
  return (proto: any, k: PropertyKey) => {
    setVar(proto, k)
    setState(proto, k, {
      value,
    })
  }
}

export function Ignore(proto: any, key: PropertyKey) {
  setIgnoreKey(proto, key)
}

export function Clear(proto: any, key: PropertyKey) {
  init(proto)

  proto._namespace.__EXPOSE_VAR__.delete(key)
  proto._namespace.__IGNORE_VAR__.delete(key)
  proto._namespace.__STATE_VAR__.delete(key)
  proto._namespace.__STATE_HANDLER__.delete(key)
  proto._namespace.__STATE_NAMESPACE__.delete(key)
}

export function Err<Fn extends (...args: any) => any>(cb: Fn) {
  return (proto: any, key: PropertyKey) => {
    setVar(proto, key)
    regisHandler(proto, key, {
      error: cb,
    })
  }
}

export function Expose(proto: any, key: PropertyKey) {
  setExposeKey(proto, key)
}

export function To(...callbacks: ((arg: any, instance: any, key: string) => any)[]) {
  return (proto: any, key: PropertyKey) => {
    setVar(proto, key)
    regisHandler(proto, key, {
      async pipe(instance: any) {
        for (const cb of callbacks)
          instance[key] = await cb(instance[key], instance, key as string)
      },
    })
  }
}

export function Tag(tag: PropertyKey) {
  return (module: any) => {
    init(module.prototype)
    module.prototype.__TAG__ = tag
  }
}

export function Unique(desc?: string) {
  return (module: any) => {
    init(module.prototype)
    module.prototype.__TAG__ = Symbol(desc || module.name)
  }
}

// async assign value to instance
export function Assign(cb: (instance?: any) => any) {
  return (module: any) => {
    init(module.prototype)
    setVar(module.prototype, SHARE_KEY)
    regisHandler(module.prototype, SHARE_KEY, {
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

export function Global(module: any) {
  init(module.prototype)
  setVar(module.prototype, SHARE_KEY)
  regisHandler(module.prototype, SHARE_KEY, {
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

export function Empty(module: any) {
  init(module.prototype)
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

export function Nested<M extends new (...args: any) => any>(module: M) {
  return To(async (property) => {
    const instance = plainToClass(module, property)

    const err = await transformClass(instance)
    if (err.length > 0)
      throw new Error(err[0])

    return instance
  })
}

export function Isolate() {
  return (target: any) => {
    target.prototype.__ISOLATE__ = true
  }
}
