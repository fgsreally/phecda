import { PHECDA_KEY, SHARE_KEY, init, set, setHandler, setStateVar } from '../core'
import { getTag, isAsyncFunc } from '../helper'
import type { Events } from '../types'
import { getKey } from '../di'

export function Isolate(module: any) {
  set(module.prototype, 'isolate', true)
  module.prototype[PHECDA_KEY].__ISOLATE__ = true
}

export function Tag(tag: PropertyKey) {
  return (module: any) => {
    set(module.prototype, 'tag', tag)
  }
}

export function Unique(desc?: string) {
  return (module: any) => {
    set(module.prototype, 'tag', Symbol(desc || module.name))
  }
}

// async assign value to instance
export function Assign(cb: (instance?: any) => any) {
  return (module: any) => {
    init(module.prototype)
    setStateVar(module.prototype, SHARE_KEY)
    setHandler(module.prototype, SHARE_KEY, {
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
  setStateVar(module.prototype, SHARE_KEY)
  setHandler(module.prototype, SHARE_KEY, {
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
    setStateVar(proto, key)
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
    setStateVar(proto, key)
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
    setStateVar(proto, key)
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
    setStateVar(proto, key)
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
    setStateVar(proto, key)
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

export function Storage({ key: storeKey, toJSON, toString }: {
  toJSON?: (str: string) => any
  toString?: (arg: any) => string
  key?: string
} = {}) {
  if (!toJSON)
    toJSON = v => JSON.parse(v)

  if (!toString)
    toString = v => JSON.stringify(v)
  return (proto: any, key?: PropertyKey) => {
    let tag: string

    if (key) {
      init(proto)
      tag = storeKey || `${getTag(proto) as string}_${key as string}`

      setStateVar(proto, key)
      setHandler(proto, key, {
        init: (instance: any) => {
          return getKey('storage')?.({ instance, key, tag, toJSON, toString })
        },
      })
    }
    else {
      init(proto.prototype)
      tag = storeKey || getTag(proto) as string
      setStateVar(proto.prototype, SHARE_KEY)
      setHandler(proto.prototype, SHARE_KEY, {
        init: (instance: any) => {
          return getKey('storage')?.({ instance, key, tag, toJSON, toString })
        },
      })
    }
  }
}