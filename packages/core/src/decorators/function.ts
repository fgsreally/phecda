import { init, set, setHandler, setStateKey } from '../core'
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
    setStateKey(model)
    setHandler(model, undefined, {
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
  setStateKey(model)
  setHandler(model, undefined, {
    init: async (instance: any) => {
      const tag = getTag(instance)

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
  key: PropertyKey
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
        return cb = getInject('watcher')?.({ eventName, instance, key, options })
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
    // @todo
    // if (typeof proto === 'function')
    //   proto = proto.prototype

    const tag = storeKey || getTag(proto)

    init(proto)

    setStateKey(proto, key)
    setHandler(proto, key, {
      init: (instance: any) => {
        return getInject('storage')?.({ instance, key, tag, toJSON: json, toString: stringify })
      },
    })
  }
}

export function If(value: Boolean, ...decorators: (ClassDecorator[]) | (PropertyDecorator[]) | (ParameterDecorator[])) {
  if (value) {
    return (...args: any[]) => {
      // @ts-expect-error  parameters pass to decorators
      decorators.forEach(d => d(...args))
    }
  }

  return () => {}
}
