import type { to } from './helper'
import { init, regisHandler, setExposeKey, setIgnoreKey, setModalVar } from './core'

export function Init(target: any, key: PropertyKey) {
  setModalVar(target, key)

  regisHandler(target, key, {
    async init(instance: any) {
      instance[key]()
    },
  })
}

export function Rule(rule: RegExp | string | Function | number,
  info: string,
  meta?: any) {
  return (obj: any, key: PropertyKey) => {
    setModalVar(obj, key)
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
    setModalVar(target, key)
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
    setModalVar(obj, key)
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
    setModalVar(target.prototype, '__CLASS')
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
  if (!(globalThis as any).__PHECDA__)
    (globalThis as any).__PHECDA__ = {}
  const tag = target.prototype.__TAG__
  if (tag)
    (globalThis as any).__PHECDA__[tag] = target
}
