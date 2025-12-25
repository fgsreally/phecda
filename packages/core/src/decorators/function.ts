import { init, set, setMeta } from '../core'
import { getTag, isAsyncFunc } from '../helper'
import type { Events } from '../types'
import { getInject } from '../di'

export function Isolate(model: any) {
  set(model.prototype, 'isolate', true)
}

export function Tag(tag: PropertyKey) {
  return (model: any) => {
    set(model.prototype, 'tag', tag)
  }
}

export function Unique(desc?: string) {
  return (model: any) => {
    set(model.prototype, 'tag', Symbol(desc || model.name))
  }
}

// async assign value to instance
export function Assign(cb: (instance?: any) => any) {
  return (model: any) => {
    setMeta(model, undefined, undefined, {
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

export function Global(model: any) {
  setMeta(model, undefined, undefined, {
    init: async (instance: any) => {
      const tag = getTag(instance)
      if (!(globalThis as any).__PHECDA__)
        (globalThis as any).__PHECDA__ = {};
      (globalThis as any).__PHECDA__[tag] = instance.constructor
    },
  })
}

// @todo  when function return a Promise
export function Err(cb: (e: Error | any, instance: any, property: string) => void, isCatch = false) {
  return (proto: any, property: PropertyKey) => {
    setMeta(proto, property, undefined, {
      init: (instance: any) => {
        if (typeof instance[property] === 'function') {
          const oldFn = instance[property].bind(instance)
          if (isAsyncFunc(oldFn)) {
            instance[property] = async (...args: any) => {
              try {
                await oldFn(...args)
              }
              catch (e) {
                cb(e, instance, property as string)
                if (!isCatch)
                  throw e
              }
            }
          }
          else {
            instance[property] = (...args: any) => {
              try {
                oldFn(...args)
              }
              catch (e) {
                cb(e, instance, property as string)
                if (!isCatch)
                  throw e
              }
            }
          }
        }
      },
    })
  }
}

export interface StorageParam {
  property: PropertyKey
  instance: any
  tag: string
  toJSON: (str: string) => any
  toString: (arg: any) => string
}

export interface WatcherParam {
  property: string
  instance: any
  eventName: string
  options?: { once?: boolean }
}

export function Watcher(eventName: keyof Events, options?: { once?: boolean }) {
  let cb: Function
  return (proto: any, property: string) => {
    setMeta(proto, property, undefined, {
      init(instance: any) {
        return cb = getInject('watcher')?.({ eventName, instance, property, options })
      },
      unmount() {
        return cb?.()
      },
    })
  }
}

export function Effect(cb: (value: any, instance: any, property: string) => void) {
  return (proto: any, property: string) => {
    setMeta(proto, property, undefined, {
      init(instance: any) {
        instance[`$_${property}`] = instance[property]
        Object.defineProperty(instance, property, {
          get() {
            return instance[`$_${property}`]
          },
          set(v) {
            instance[`$_${property}`] = v
            cb(v, instance, property)
            return true
          },
        })
      },
    })
  }
}

export function Storage({ key, json, stringify }: {
  json?: (str: string) => any
  stringify?: (arg: any) => string
  key?: string
} = {}) {
  if (!json)
    json = v => JSON.parse(v)

  if (!stringify)
    stringify = v => JSON.stringify(v)

  return (proto: any, property?: PropertyKey) => {
    const tag = key || getTag(proto)

    init(proto)

    setMeta(proto, property, undefined, {
      init: (instance: any) => {
        return getInject('storage')?.({ instance, property, tag, toJSON: json, toString: stringify })
      },
    })
  }
}
