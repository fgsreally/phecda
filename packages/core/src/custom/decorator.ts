// custom decorator

import { init, regisHandler, setModalVar } from '../core'
import { getProperty } from '../namespace'
import type { Events } from '../types'

export function Watcher(eventName: keyof Events, options?: { once: boolean }) {
  return (obj: any, key: string) => {
    setModalVar(obj, key)
    regisHandler(obj, key, {
      init(instance: any) {
        getProperty('watcher')?.({ eventName, instance, key, options })
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

      setModalVar(target, uniTag)
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
      setModalVar(target.prototype, uniTag)
      regisHandler(target.prototype, uniTag, {
        init: (instance: any) => {
          getProperty('storage')?.({ instance, key: '', tag })
        },
      })
    }
  }
}
