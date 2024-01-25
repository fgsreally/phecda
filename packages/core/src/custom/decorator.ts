// custom decorator

import { init, regisHandler, setVar } from '../core'
import type { Events } from '../types'

export const activeInstance: Record<string, any> = {}

export function injectProperty(key: string, value: any) {
  activeInstance[key] = value
  return activeInstance
}

export function getProperty(key: string) {
  return activeInstance[key]
}


export function Watcher(eventName: keyof Events, options?: { once: boolean }) {
  return (proto: any, key: string) => {
    setVar(proto, key)
    regisHandler(proto, key, {
      init(instance: any) {
        getProperty('watcher')?.({ eventName, instance, key, options })
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

export function Storage(storeKey?: string) {
  return (proto: any, key?: PropertyKey) => {
    let tag: string

    if (key) {
      init(proto)
      tag = storeKey || proto.__TAG__
      const uniTag = Symbol(tag)

      setVar(proto, uniTag)
      regisHandler(proto, uniTag, {
        init: (instance: any) => {
          getProperty('storage')?.({ instance, key, tag })
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
          getProperty('storage')?.({ instance, key: '', tag })
        },
      })
    }
  }
}
