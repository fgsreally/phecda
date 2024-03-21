// custom decorator

import { SHARE_KEY, init, regisHandler, setVar } from '../core'
import type { Events } from '../types'

export interface StorageParam {
  key: string
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

export const activeInstance: Record<string, any> = {}

export function injectProperty(key: string, value: any) {
  activeInstance[key] = value
  return activeInstance
}

export function getProperty(key: string) {
  return activeInstance[key]
}

export function Watcher(eventName: keyof Events, options?: { once?: boolean }) {
  let cb: Function
  return (proto: any, key: string) => {
    setVar(proto, key)
    regisHandler(proto, key, {
      init(instance: any) {
        return cb = getProperty('watcher')?.({ eventName, instance, key, options })
      },
      unmount() {
        return cb?.()
      },
    })
  }
}

export function Effect(eventName: string, options?: any) {
  return (proto: any, key: string) => {
    setVar(proto, key)
    regisHandler(proto, key, {
      init(instance: any) {
        instance[`$_${key}`] = instance[key]
        Object.defineProperty(instance, key, {
          get() {
            return instance[`$_${key}`]
          },
          set(v) {
            instance[`$_${key}`] = v
            getProperty(`effect-${eventName}`)?.({ instance, key, value: v, options })
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
      tag = storeKey || getTag(proto) as string

      setVar(proto, SHARE_KEY)
      regisHandler(proto, SHARE_KEY, {
        init: (instance: any) => {
          return getProperty('storage')?.({ instance, key, tag, toJSON, toString })
        },
      })
    }
    else {
      init(proto.prototype)
      tag = storeKey || `${proto.prototype.__TAG__}_${key}`
      const uniTag = Symbol(tag)
      setVar(proto.prototype, uniTag)
      regisHandler(proto.prototype, uniTag, {
        init: (instance: any) => {
          return getProperty('storage')?.({ instance, key: '', tag, toJSON, toString })
        },
      })
    }
  }
}
