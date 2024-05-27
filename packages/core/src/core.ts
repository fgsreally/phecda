/* eslint-disable no-prototype-builtins */
import type { Construct, Handler, Phecda } from './types'

// 有的时候，类上多个方法、属性需要共用一些东西
// SHARE_KEY就是共有数据存储的键值，所有key为可选的函数，key默认即SHARE_KEY
export const SHARE_KEY = Symbol('phecda')
export const PHECDA_KEY = Symbol('phecda')
// type safe
// 由于绝大部分的后续使用都是通过实例化（不支持抽象类），故不加AbConstruct
export function isPhecda(model: any): model is Construct {
  if (typeof model === 'function')
    return !!model.prototype[PHECDA_KEY]

  return false
}

export function init(proto: Phecda) {
  if (!proto)
    return
  if (!proto.hasOwnProperty(PHECDA_KEY)) {
    proto[PHECDA_KEY] = {

      /**
         * 暴露的变量，
         * 只要属性上存在至少一个装饰器，该属性就会被捕捉到
        */
      __EXPOSE_KEY: new Set(),
      /**
         * @Ignore 绑定的属性，
         * 某属性即使被捕捉，可被强行忽略，优先级最高
        */
      __IGNORE_KEY: new Set(),
      /**
         * @Clear 绑定的属性，
         * 消除父类在该key上的state/handler, 但export key 和 state
        */

      __CLEAR_KEY: new Set(),
      /**
         * 存在状态的变量
         * @deprecated
        */
      __STATE_KEY: new Set(),
      /**
         * 状态变量的处理器
        */
      __STATE_HANDLER__: new Map(),
      /**
         * 状态变量的共有状态
        */
      __STATE_NAMESPACE__: new Map(),
    }
  }
}
export function getPhecdaFromTarget(target: any) {
  if (typeof target === 'function')
    return target.prototype// class/model

  if (target.hasOwnProperty(PHECDA_KEY))
    return target// prototype

  return Object.getPrototypeOf(target)// module
}

// it should be setmodelVar
export function setStateKey(proto: Phecda, key?: PropertyKey) {
  if (!key) {
    key = SHARE_KEY
    proto = proto.prototype
  }
  init(proto)

  proto[PHECDA_KEY].__STATE_KEY.add(key)
  // 绑定状态的值，均属于暴露的值
  setExposeKey(proto, key)
}

export function setExposeKey(proto: Phecda, key?: PropertyKey) {
  if (!key) {
    key = SHARE_KEY
    proto = proto.prototype
  }
  init(proto)

  proto[PHECDA_KEY].__EXPOSE_KEY.add(key)
}

export function setIgnoreKey(proto: Phecda, key?: PropertyKey) {
  if (!key) {
    key = SHARE_KEY
    proto = proto.prototype
  }
  init(proto)
  proto[PHECDA_KEY].__IGNORE_KEY.add(key)
}

export function setHandler(proto: Phecda, key: PropertyKey | undefined, handler: Handler) {
  if (!key) {
    key = SHARE_KEY
    proto = proto.prototype
  }
  init(proto)
  if (!proto[PHECDA_KEY].__STATE_HANDLER__.has(key))
    proto[PHECDA_KEY].__STATE_HANDLER__.set(key, [handler])
  else
    proto[PHECDA_KEY].__STATE_HANDLER__.get(key)!.push(handler)
}

export function setState(proto: Phecda, key: PropertyKey | undefined, state: Record<string, any>) {
  if (!key) {
    key = SHARE_KEY
    proto = proto.prototype
  }
  init(proto)
  const namespace = proto[PHECDA_KEY].__STATE_NAMESPACE__

  namespace.set(key, state)
}

// 存在状态的属性
export function getOwnStateKey(target: any) {
  const proto: Phecda = getPhecdaFromTarget(target)
  return [...proto[PHECDA_KEY].__STATE_KEY] as string[]
}

export function getStateKey(target: any) {
  let proto: Phecda = getPhecdaFromTarget(target)
  const set = new Set<PropertyKey>()
  while (proto?.[PHECDA_KEY]) {
    if (proto.hasOwnProperty(PHECDA_KEY))
      proto[PHECDA_KEY].__STATE_KEY.forEach(item => set.add(item))

    proto = Object.getPrototypeOf(proto)
  }
  return [...set]
}
// 暴露的属性
// 存在状态必然暴露，反之未必，但expose可以被ignore，前者不行
// 一般而言用这个就行，某些特定情况，可用前一种
export function getOwnExposeKey(target: any) {
  const proto: Phecda = getPhecdaFromTarget(target)

  return [...proto[PHECDA_KEY].__EXPOSE_KEY].filter(item => !proto[PHECDA_KEY].__IGNORE_KEY.has(item)) as string[]
}

export function getExposeKey(target: any) {
  let proto: Phecda = getPhecdaFromTarget(target)

  const set = new Set<PropertyKey>()
  const origin = proto
  while (proto?.[PHECDA_KEY]) {
    if (proto.hasOwnProperty(PHECDA_KEY))
      [...proto[PHECDA_KEY].__EXPOSE_KEY].forEach(item => !origin[PHECDA_KEY].__IGNORE_KEY.has(item) && set.add(item))

    proto = Object.getPrototypeOf(proto)
  }
  return [...set]
}

export function getOwnIgnoreKey(target: any) {
  const proto: Phecda = getPhecdaFromTarget(target)

  return [...proto[PHECDA_KEY]?.__IGNORE_KEY] as string[]
}

export function getOwnHandler(target: any, key: PropertyKey) {
  const proto: Phecda = getPhecdaFromTarget(target)

  return proto[PHECDA_KEY]?.__STATE_HANDLER__.get(key) || []
}

export function getHandler(target: any, key: PropertyKey) {
  let proto: Phecda = getPhecdaFromTarget(target)
  const set = new Set<any>()
  while (proto?.[PHECDA_KEY]) {
    if (proto.hasOwnProperty(PHECDA_KEY)) {
      proto[PHECDA_KEY].__STATE_HANDLER__.get(key)?.forEach(item => set.add(item))
      if (proto[PHECDA_KEY].__CLEAR_KEY.has(key))
        break
    }
    proto = Object.getPrototypeOf(proto)
  }

  return [...set]
}

export function getState(target: any, key: PropertyKey = SHARE_KEY) {
  let proto: Phecda = getPhecdaFromTarget(target)
  let ret: any = {}
  while (proto?.[PHECDA_KEY]) {
    if (proto.hasOwnProperty(PHECDA_KEY)) {
      const state = proto[PHECDA_KEY].__STATE_NAMESPACE__.get(key)

      if (state)
        ret = { ...state, ...ret }

      if (proto[PHECDA_KEY].__CLEAR_KEY.has(key))
        break
    }
    proto = Object.getPrototypeOf(proto)
  }

  return ret
}
export function getOwnState(target: any, key: PropertyKey = SHARE_KEY): Record<string, any> {
  const proto: Phecda = getPhecdaFromTarget(target)

  return proto[PHECDA_KEY].__STATE_NAMESPACE__.get(key) || {}
}

export function invokeHandler(event: string, module: Phecda) {
  const stateVars = getExposeKey(module) as PropertyKey[]

  const initHandlers = stateVars.map((item) => {
    return getHandler(module, item).filter(h => !!h[event]).map(h => h[event](module))
  }).flat()

  return Promise.all(initHandlers)
}

export function set(proto: any, key: string, value: any) {
  init(proto)
  proto[`__${key.toUpperCase()}__`] = value
}

export function get(proto: any, key: string) {
  return proto[`__${key.toUpperCase()}__`]
}
