import type { to } from './helper'
import { init, regisHandler, setExposeKey, setIgnoreKey, setModalState } from './core'

export function Init(target: any, key: PropertyKey) {
  setModalState(target, key)

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
    setModalState(obj, key)
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
}

export function Err<Fn extends (...args: any) => any>(cb: Fn) {
  return (target: any, key: PropertyKey) => {
    setModalState(target, key)
    regisHandler(target, key, {
      error: cb,
    })
  }
}

export function Get(target: any, key: PropertyKey) {
  setExposeKey(target, key)
}

export function Pipe(v: ReturnType<typeof to>) {
  return (obj: any, key: PropertyKey) => {
    setModalState(obj, key)
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
    init(target.prototype)
    target.prototype._namespace.__TAG__ = tag
  }
}

export function Storage(target: any) {
  init(target.prototype)

  const tag = target.prototype._namespace.__TAG__
  if (tag === '')
    throw new Error('miss tag')
  const uniTag = Symbol(tag)
  setModalState(target.prototype, uniTag)
  regisHandler(target.prototype, uniTag, {
    init: (instance: any) => {
      const { state } = instance

      window.addEventListener('beforeunload', () => {
        localStorage.setItem(`_phecda_${tag}`, JSON.stringify(state))
      })
      const lastObjStr = localStorage.getItem(`_phecda_${tag}`)
      if (lastObjStr && lastObjStr !== 'undefined') {
        const lastObj = JSON.parse(lastObjStr)
        for (const i in lastObj)
          state[i] = lastObj[i]
      }
    },
  })
}
export function Window(target: any) {
  if (!window.__PHECDA__)
    window.__PHECDA__ = {}
  const tag = target.prototype._namespace.__TAG__
  if (tag)
    window.__PHECDA__[tag] = target
}
