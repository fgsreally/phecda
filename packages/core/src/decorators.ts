import { plainToClass, transformClass } from './helper'
import { init, regisHandler, setExposeKey, setIgnoreKey, setVar, setState } from './core'
import type { InjectData } from './types'

export function Init(target: any, key: PropertyKey) {
  setVar(target, key)

  regisHandler(target, key, {
    async init(instance: any) {
      instance[key]()
    },
  })
}

// bind value
export function Bind(value: any) {
  return (target: any, k: PropertyKey) => {
    setVar(target, k)
    setState(target, k, {
      value,
    })
  }
}

// export function Rule(rule: RegExp | string | ((arg: any) => Promise<boolean> | boolean | 'ok') | number,
//   info: string | ((k: string, tag: string) => string),
//   meta?: any) {
//   return (obj: any, key: PropertyKey) => {
//     setVar(obj, key)
//     regisHandler(obj, key, {
//       rule,
//       info,
//       meta,
//     })
//   }
// }

export function Ignore(target: any, key: PropertyKey) {
  setIgnoreKey(target, key)
}

export function Clear(target: any, key: PropertyKey) {
  init(target)

  target._namespace.__EXPOSE_VAR__.delete(key)
  target._namespace.__IGNORE_VAR__.delete(key)
  target._namespace.__STATE_VAR__.delete(key)
  target._namespace.__STATE_HANDLER__.delete(key)
  target._namespace.__STATE_NAMESPACE__.delete(key)
}

export function Err<Fn extends (...args: any) => any>(cb: Fn) {
  return (target: any, key: PropertyKey) => {
    setVar(target, key)
    regisHandler(target, key, {
      error: cb,
    })
  }
}

export function Expose(target: any, key: PropertyKey) {
  setExposeKey(target, key)
}

export function To(cb: (arg: any, instance: any, key: string) => any) {
  return (proto: any, key: PropertyKey) => {
    setVar(proto, key)
    regisHandler(proto, key, {
      async pipe(instance: any) {
        instance[key] = await cb(instance[key], instance, key as string)
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
    setVar(target.prototype, '__CLASS')
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
  setVar(target.prototype, '__CLASS')
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

export function Nested<M extends new (...args: any) => any>(Model: M) {
  return To(async (property) => {
    const instance = plainToClass(Model, property)

    const err = await transformClass(instance)
    if (err.length > 0)
      throw new Error(err[0])

    return instance
  })
}
