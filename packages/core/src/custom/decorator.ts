// custom decorator

import { init, regisHandler, setModelVar } from '../core'
import { getProperty } from '../namespace'
import type { Events } from '../types'

export function Watcher(eventName: keyof Events, options?: { once: boolean }) {
  return (obj: any, key: string) => {
    setModelVar(obj, key)
    regisHandler(obj, key, {
      init(instance: any) {
        getProperty('watcher')?.({ eventName, instance, key, options })
      },
    })
  }
}

export function Effect(eventName: string, options?: any) {
  return (obj: any, key: string) => {
    setModelVar(obj, key)
    regisHandler(obj, key, {
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
  return (target: any, key?: PropertyKey) => {
    let tag: string

    if (key) {
      init(target)
      tag = storeKey || target.__TAG__
      const uniTag = Symbol(tag)

      setModelVar(target, uniTag)
      regisHandler(target, uniTag, {
        init: (instance: any) => {
          getProperty('storage')?.({ instance, key, tag })
        },
      })
    }
    else {
      init(target.prototype)
      tag = storeKey || `${target.prototype.__TAG__}_${key}`
      const uniTag = Symbol(tag)
      setModelVar(target.prototype, uniTag)
      regisHandler(target.prototype, uniTag, {
        init: (instance: any) => {
          getProperty('storage')?.({ instance, key: '', tag })
        },
      })
    }
  }
}
