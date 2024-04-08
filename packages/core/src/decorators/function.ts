import { PHECDA_KEY, SHARE_KEY, init, set, setHandler, setStateKey } from '../core'
import { getTag, isAsyncFunc } from '../helper'
import type { Events } from '../types'
import { getKey } from '../di'

export function Isolate(model: any) {
  set(model.prototype, 'isolate', true)
  model.prototype[PHECDA_KEY].__ISOLATE__ = true
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
    init(model.prototype)
    setStateKey(model.prototype, SHARE_KEY)
    setHandler(model.prototype, SHARE_KEY, {
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
  init(model.prototype)
  setStateKey(model.prototype, SHARE_KEY)
  setHandler(model.prototype, SHARE_KEY, {
    init: async (instance: any) => {
      const tag = instance[PHECDA_KEY].__TAG__
      if (!tag)
        return
      if (!(globalThis as any).__PHECDA__)
        (globalThis as any).__PHECDA__ = {};
      (globalThis as any).__PHECDA__[tag] = instance.constructor
    },
  })
}

export function To(...callbacks: ((arg: any, instance: any, key: string) => any)[]) {
  return (proto: any, key: PropertyKey) => {
    setStateKey(proto, key)
    setHandler(proto, key, {
      async pipe(instance: any, addError: (msg: string) => void) {
        for (const cb of callbacks) {
          try {
            if (isAsyncFunc(cb))
              instance[key] = await cb(instance[key], instance, key as string)

            else
              instance[key] = cb(instance[key], instance, key as string)
          }
          catch (e: any) {
            addError(e.message)
          }
        }
      },
    })
  }
}

export function Rule(cb: ((arg: any,) => boolean | Promise<boolean>), info: string | (() => string)) {
  return (proto: any, key: PropertyKey) => {
    setStateKey(proto, key)
    setHandler(proto, key, {
      async pipe(instance: any, addError: (msg: string) => void) {
        let ret: any
        if (isAsyncFunc(cb))
          ret = await cb(instance[key])

        else
          ret = cb(instance[key])
        if (!ret) {
          if (typeof info === 'string')
            addError(info)
          else
            addError(info())
        }
      },
    })
  }
}

// @todo  when function return a Promise
export function Err(cb: (e: Error | any, instance: any, key: string) => void, isCatch = false) {
  return (proto: any, key: PropertyKey) => {
    setStateKey(proto, key)
    setHandler(proto, key, {
      init: (instance: any) => {
        if (typeof instance[key] === 'function') {
          const oldFn = instance[key].bind(instance)
          if (isAsyncFunc(oldFn)) {
            instance[key] = async (...args: any) => {
              try {
                await oldFn(...args)
              }
              catch (e) {
                cb(e, instance, key as string)
                if (!isCatch)
                  throw e
              }
            }
          }
          else {
            instance[key] = (...args: any) => {
              try {
                oldFn(...args)
              }
              catch (e) {
                cb(e, instance, key as string)
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
  key?: string
  instance: any
  tag: string
  toJSON: (str: string) => any
  toString: (arg: any) => string
}

export interface WatcherParam {
  key: string
  instance: any
  eventName: string
  options?: { once?: boolean }
}

export function Watcher(eventName: keyof Events, options?: { once?: boolean }) {
  let cb: Function
  return (proto: any, key: string) => {
    setStateKey(proto, key)
    setHandler(proto, key, {
      init(instance: any) {
        return cb = getKey('watcher')?.({ eventName, instance, key, options })
      },
      unmount() {
        return cb?.()
      },
    })
  }
}

export function Effect(cb: (value: any, instance: any, key: string) => void) {
  return (proto: any, key: string) => {
    setStateKey(proto, key)
    setHandler(proto, key, {
      init(instance: any) {
        instance[`$_${key}`] = instance[key]
        Object.defineProperty(instance, key, {
          get() {
            return instance[`$_${key}`]
          },
          set(v) {
            instance[`$_${key}`] = v
            cb(v, instance, key)
            return true
          },
        })
      },
    })
  }
}

export function Storage({ key: storeKey, json, stringify }: {
  json?: (str: string) => any
  stringify?: (arg: any) => string
  key?: string
} = {}) {
  if (!json)
    json = v => JSON.parse(v)

  if (!stringify)
    stringify = v => JSON.stringify(v)

  return (proto: any, key?: PropertyKey) => {
    const tag = storeKey || String(getTag(proto))

    if (key) {
      init(proto)

      setStateKey(proto, key)
      setHandler(proto, key, {
        init: (instance: any) => {
          return getKey('storage')?.({ instance, key, tag, toJSON: json, toString: stringify })
        },
      })
    }
    else {
      init(proto.prototype)
      setStateKey(proto.prototype, SHARE_KEY)
      setHandler(proto.prototype, SHARE_KEY, {
        init: (instance: any) => {
          return getKey('storage')?.({ instance, key, tag, toJSON: json, toString: stringify })
        },
      })
    }
  }
}
