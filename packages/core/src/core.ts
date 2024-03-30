/* eslint-disable no-prototype-builtins */
import type { Construct, Handler, Phecda } from './types'

// 有的时候，类上多个方法、属性需要共用一些东西
// SHARE_KEY就是共有数据存储的键值，所有key为可选的函数，key默认即SHARE_KEY
export const SHARE_KEY = Symbol('phecda')
export const PHECDA_KEY = Symbol('phecda')
// type safe
// 由于绝大部分的后续使用都是通过实例化（不支持抽象类），故不加AbConstruct
export function isPhecda(module: any): module is Construct {
  if (typeof module === 'function')
    return !!module.prototype?.[PHECDA_KEY]

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
      __EXPOSE_VAR__: new Set(),
      /**
         * @Ignore 绑定的属性，
         * 某属性即使被捕捉，可被强行忽略，优先级最高
        */
      __IGNORE_VAR__: new Set(),
      /**
         * 存在状态的变量
         * @deprecated
        */
      __STATE_VAR__: new Set(),
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
function getPhecdaFromTarget(target: any) {
  if (typeof target === 'function')
    return target.prototype

  if (target.hasOwnProperty(PHECDA_KEY))
    return target

  return Object.getPrototypeOf(target)
}

// export function regisInitEvent(module: Phecda, key: string) {
//   init(module)
//   module[PHECDA_KEY].__INIT_EVENT__.add(key)
// }

// export function getOwnInitEvent(instance: Phecda) {
//   instance=Object.getPrototypeOf(instance)
//   return [...instance[PHECDA_KEY].__INIT_EVENT__] as string[]
// }
// export function getInitEvent(instance: Phecda) {
//   let proto: Phecda = Object.getPrototypeOf(instance)
//   const set = new Set<PropertyKey>()
//   while (proto?.[PHECDA_KEY]) {
//     proto[PHECDA_KEY].__INIT_EVENT__.forEach(item => set.add(item))

//     proto=Object.getPrototypeOf(proto)
//   }
//   return [...set]
// }

// it should be setmodelVar
export function setStateVar(proto: Phecda, key: PropertyKey) {
  init(proto)

  proto[PHECDA_KEY].__STATE_VAR__.add(key)
  // 绑定状态的值，均属于暴露的值
  setExposeKey(proto, key)
}

export function setExposeKey(proto: Phecda, key: PropertyKey) {
  init(proto)

  proto[PHECDA_KEY].__EXPOSE_VAR__.add(key)
}

export function setIgnoreKey(proto: Phecda, key: PropertyKey) {
  init(proto)
  proto[PHECDA_KEY].__IGNORE_VAR__.add(key)
}

export function setHandler(proto: Phecda, key: PropertyKey, handler: Handler) {
  init(proto)
  if (!proto[PHECDA_KEY].__STATE_HANDLER__.has(key))
    proto[PHECDA_KEY].__STATE_HANDLER__.set(key, [handler])
  else
    proto[PHECDA_KEY].__STATE_HANDLER__.get(key)!.push(handler)
}

export function setState(proto: Phecda, key: PropertyKey, state: Record<string, any>) {
  init(proto)
  const namespace = proto[PHECDA_KEY].__STATE_NAMESPACE__

  namespace.set(key, state)
}

// 存在状态的属性
export function getOwnStateVars(target: any) {
  const proto: Phecda = getPhecdaFromTarget(target)
  return [...proto[PHECDA_KEY].__STATE_VAR__] as string[]
}

export function getStateVars(target: any) {
  let proto: Phecda = getPhecdaFromTarget(target)
  const set = new Set<PropertyKey>()
  while (proto?.[PHECDA_KEY]) {
    proto[PHECDA_KEY].__STATE_VAR__.forEach(item => set.add(item))

    proto = Object.getPrototypeOf(proto)
  }
  return [...set]
}
// 暴露的属性
// 存在状态必然暴露，反之未必，但expose可以被ignore，前者不行
// 一般而言用这个就行，某些特定情况，可用前一种
export function getOwnExposeKey(target: any) {
  const proto: Phecda = getPhecdaFromTarget(target)

  return [...proto[PHECDA_KEY].__EXPOSE_VAR__].filter(item => !proto[PHECDA_KEY].__IGNORE_VAR__.has(item)) as string[]
}

export function getExposeKey(target: any) {
  let proto: Phecda = getPhecdaFromTarget(target)

  const set = new Set<PropertyKey>()
  while (proto?.[PHECDA_KEY]) {
    [...proto[PHECDA_KEY].__EXPOSE_VAR__].forEach(item => !proto[PHECDA_KEY].__IGNORE_VAR__.has(item) && set.add(item))

    proto = Object.getPrototypeOf(proto)
  }
  return [...set]
}

export function getOwnIgnoreKey(target: any) {
  const proto: Phecda = getPhecdaFromTarget(target)

  if (!proto?.[PHECDA_KEY])
    return []

  return [...proto[PHECDA_KEY].__IGNORE_VAR__] as string[]
}

export function getOwnHandler(target: any, key: PropertyKey) {
  const proto: Phecda = getPhecdaFromTarget(target)

  if (!proto?.[PHECDA_KEY])
    return []

  return proto[PHECDA_KEY].__STATE_HANDLER__.get(key) || []
}

export function getHandler(target: any, key: PropertyKey) {
  let proto: Phecda = getPhecdaFromTarget(target)
  const set = new Set<any>()
  while (proto?.[PHECDA_KEY]) {
    proto[PHECDA_KEY].__STATE_HANDLER__.get(key)?.forEach(item => set.add(item))
    proto = Object.getPrototypeOf(proto)
  }

  return [...set]
}

export function getState(target: any, key: PropertyKey) {
  let proto: Phecda = getPhecdaFromTarget(target)
  let ret: any = {}
  while (proto?.[PHECDA_KEY]) {
    const state = proto[PHECDA_KEY].__STATE_NAMESPACE__.get(key)

    if (state)
      ret = { ...state, ...ret }
    proto = Object.getPrototypeOf(proto)
  }
  return ret
}
export function getOwnState(target: any, key: PropertyKey): Record<string, any> {
  const proto: Phecda = getPhecdaFromTarget(target)

  return proto[PHECDA_KEY].__STATE_NAMESPACE__.get(key) || {}
}

export function invokeHandler(event: string, instance: Phecda) {
  const stateVars = getExposeKey(instance) as PropertyKey[]

  const initHandlers = stateVars.map((item) => {
    return getHandler(instance, item).filter(h => !!h[event]).map(h => h[event](instance))
  }).flat()

  return Promise.all(initHandlers)
}
