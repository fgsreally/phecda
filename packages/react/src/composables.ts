/* eslint-disable new-cap */
import { proxy, useSnapshot } from 'valtio'
import { getHandler, getProperty, getTag, injectProperty, register } from 'phecda-core'

import { createContext, createElement, useEffect } from 'react'
import mitt from 'mitt'
import { wrapError } from './utils'
import type { ActiveInstance, PhecdaEmitter } from './types'

export const emitter: PhecdaEmitter = mitt()

let activeInstance: ActiveInstance

export function resetActiveInstance() {
  activeInstance = {
    state: {},
    _v: new WeakMap(),
    _r: new WeakMap(),
    _f: new WeakMap(),
  }
}

export function getActiveInstance() {
  return activeInstance
}

export function useO<T extends new (...args: any) => any>(module: T) {
  const { state } = getActiveInstance()
  const tag = getTag(module) || module.name
  if (tag in state)
    return state[tag]

  const instance = new module()

  state[tag] = instance
  return instance
}

export function useR<T extends new (...args: any) => any>(module: T): [InstanceType<T>, InstanceType<T>] {
  const { _r, _f } = getActiveInstance()
  const instance = useO(module)
  if (_r.has(instance)) {
    const proxyInstance = _r.get(instance)
    return [useSnapshot(proxyInstance), proxyInstance]
  }

  const proxyInstance = proxy(new Proxy(instance, {
    get(target: any, key) {
      if (typeof target[key] === 'function') {
        if (_f.has(target[key]))
          return _f.get(target[key])
        const errorHandler = getHandler(target, key).find((item: any) => item.error)?.error
        if (!errorHandler)
          return target[key].bind(target)
        const wrapper = wrapError(target, key, errorHandler)
        _f.set(target[key], wrapper)
        return wrapper
      }

      return target[key]
    },
    set(target: any, key, v) {
      target[key] = v
      return true
    },
  }))
  register(proxyInstance)
  _r.set(instance, proxyInstance)

  return [useSnapshot(proxyInstance), proxyInstance]
}

export function createPhecdaContext() {
  const { Provider } = createContext(null)
  let eventRecord = [] as [string, (event: any) => void][]

  return ({ children }: any) => {
    useEffect(() => {
      return () => {
        getActiveInstance().state.clear()
        eventRecord.forEach(([eventName, handler]) =>
          (emitter as any).off(eventName as any, handler),
        )
        eventRecord = []
      }
    }, [])

    if (!getProperty('watcher')) {
      injectProperty('watcher', ({ eventName, instance, key, options }: { eventName: any; instance: any; key: string; options?: { once: boolean } }) => {
        const fn = typeof instance[key] === 'function' ? instance[key].bind(instance) : (v: any) => instance[key] = v

        if (options?.once) {
          const handler = (...args: any) => {
            fn(...args);
            (emitter as any).off(eventName, handler)
          }
          (emitter as any).on(eventName, handler)
          eventRecord.push([eventName, handler])
        }
        else {
          eventRecord.push([eventName, fn]);
          (emitter as any).on(eventName, fn)
        }
      })
    }
    if (!getProperty('storage')) {
      injectProperty('storage', ({ tag, key, instance }: { instance: any; key: string; tag: string }) => {
        if (!tag)
          return
        const initstr = localStorage.getItem(tag)
        // localStorage.removeItem(tag)
        if (initstr) {
          const data = JSON.parse(initstr)
          if (key) {
            instance[key] = data
          }
          else {
            for (const i in data) {
              if (i)
                instance[i] = data[i]
            }
          }
        }
        globalThis.addEventListener('beforeunload', () => {
          localStorage.setItem(tag, JSON.stringify(key ? instance[key] : instance))
        })
      })
    }
    return createElement(Provider, { value: null }, children)
  }
}
