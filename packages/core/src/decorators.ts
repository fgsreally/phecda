import type { to } from './helper'
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

export function Rule(rule: RegExp | string | ((arg: any) => boolean | 'ok') | number,
  info: string | ((k: string) => string),
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

export function Pipe(v: ReturnType<typeof to>) {
  return (obj: any, key: PropertyKey) => {
    setModelVar(obj, key)
    regisHandler(obj, key, {
      async pipe(instance: any) {
        const tasks = v.value
        for (const task of tasks)
          instance[key] = await task(instance[key])
      },
    })
  }
}

export function Tag(tag: string) {
  return (target: any) => {
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
    init: async () => {
      const tag = target.prototype.__TAG__
      if (!tag)
        return
      if (!(globalThis as any).__PHECDA__)
        (globalThis as any).__PHECDA__ = {};
      (globalThis as any).__PHECDA__[tag] = target
    },
  })
}

export function Empty(_target: any) { }

export const DataMap = {} as InjectData

export function Provide<K extends keyof InjectData>(key: K, value: InjectData[K]) {
  DataMap[key] = value
}

export function Inject<K extends keyof InjectData>(key: K): InjectData[K] {
  return DataMap[key] || (() => Empty) /** work for @Inject(x)(...) */
}
