import type { Phecda, Handler } from './types'

export function isPhecda(target: any) {
  return target && !!target.prototype._namespace
}
// 一个类挂载第一个phecda装饰器时，会创建对应的，类似元数据的东西
export function init(target: Phecda) {
  if (!target)
    return
  // eslint-disable-next-line no-prototype-builtins
  if (!target.hasOwnProperty('_namespace')) {
    target._namespace = {

      /**
         * @Init 事件,
         * 引入Model时就会执行
        */
      __INIT_EVENT__: new Set(),
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

export function regisInitEvent(target: Phecda, key: string) {
  init(target)
  target._namespace.__INIT_EVENT__.add(key)
}

export function getOwnInitEvent(target: Phecda) {
  if (!target?._namespace)
    return []
  return [...target._namespace.__INIT_EVENT__] as string[]
}
export function getInitEvent(target: Phecda) {
  let proto: Phecda = Object.getPrototypeOf(target)
  const set = new Set<PropertyKey>()
  while (proto?._namespace) {
    proto._namespace.__INIT_EVENT__.forEach(item => set.add(item))

    proto = Object.getPrototypeOf(proto)
  }
  return [...set]
}

// it should be setmodelVar
export function setModelVar(target: Phecda, key: PropertyKey) {
  init(target)
  target._namespace.__STATE_VAR__.add(key)
  // 绑定状态的值，均属于暴露的值
  setExposeKey(target, key)
}

export function setExposeKey(target: Phecda, key: PropertyKey) {
  init(target)
  target._namespace.__EXPOSE_VAR__.add(key)
}

export function setIgnoreKey(target: Phecda, key: PropertyKey) {
  init(target)
  target._namespace.__IGNORE_VAR__.add(key)
}

// 存在状态的属性
export function getOwnModelState(target: Phecda) {
  target = Object.getPrototypeOf(target)

  return [...target._namespace.__STATE_VAR__] as string[]
}

export function getModelState(target: Phecda) {
  let proto: Phecda = Object.getPrototypeOf(target)
  const set = new Set<PropertyKey>()
  while (proto?._namespace) {
    proto._namespace.__STATE_VAR__.forEach(item => set.add(item))

    proto = Object.getPrototypeOf(proto)
  }
  return [...set]
}
// 暴露的属性
// 存在状态必然暴露，反之未必，但expose可以被ignore，前者不行
// 一般而言用这个就行，某些特定情况，可用前一种
export function getOwnExposeKey(target: Phecda) {
  target = Object.getPrototypeOf(target)
  return [...target._namespace.__EXPOSE_VAR__].filter(item => !target._namespace.__IGNORE_VAR__.has(item)) as string[]
}

export function getExposeKey(target: Phecda) {
  let proto = Object.getPrototypeOf(target)
  const set = new Set<PropertyKey>()
  while (proto?._namespace) {
    [...proto._namespace.__EXPOSE_VAR__].forEach(item => !proto._namespace.__IGNORE_VAR__.has(item) && set.add(item))

    proto = Object.getPrototypeOf(proto)
  }
  return [...set]
}

export function getOwnIgnoreKey(target: Phecda) {
  if (!target?._namespace)
    return []

  return [...target._namespace.__IGNORE_VAR__] as string[]
}

export function regisHandler(target: Phecda, key: PropertyKey, handler: Handler) {
  init(target)
  if (!target._namespace.__STATE_HANDLER__.has(key))
    target._namespace.__STATE_HANDLER__.set(key, [handler])
  else
    target._namespace.__STATE_HANDLER__.get(key)!.push(handler)
}

export function getOwnHandler(target: Phecda, key: PropertyKey) {
  if (!target?._namespace)
    return []

  return target._namespace.__STATE_HANDLER__.get(key) || []
}

export function getHandler(target: Phecda, key: PropertyKey) {
  let proto: Phecda = Object.getPrototypeOf(target)
  const set = new Set<any>()
  while (proto?._namespace) {
    proto._namespace.__STATE_HANDLER__.get(key)?.forEach(item => set.add(item))
    proto = Object.getPrototypeOf(proto)
  }

  return [...set]
}

export function setState(target: Phecda, key: PropertyKey, state: Record<string, any>) {
  init(target)
  const namespace = target._namespace.__STATE_NAMESPACE__

  namespace.set(key, state)
}
export function getOwnState(target: Phecda, key: PropertyKey) {
  target = Object.getPrototypeOf(target)
  return target._namespace.__STATE_NAMESPACE__.get(key) || {}
}

export function getState(target: Phecda, key: PropertyKey) {
  let proto: Phecda = Object.getPrototypeOf(target)
  let ret: any = {}
  while (proto?._namespace) {
    const state = proto._namespace.__STATE_NAMESPACE__.get(key)

    if (state)
      ret = { ...state, ...ret }
    proto = Object.getPrototypeOf(proto)
  }
  return ret
}

// work for init
export function register(instance: Phecda) {
  const stateVars = getExposeKey(instance) as PropertyKey[]

  for (const item of stateVars) {
    const handlers = getHandler(instance, item)

    for (const hanlder of handlers)
      hanlder.init?.(instance)
  }
}

export async function registerAsync(instance: Phecda) {
  const stateVars = getExposeKey(instance) as PropertyKey[]

  for (const item of stateVars) {
    const handlers = getHandler(instance, item)
    for (const hanlder of handlers)
      await hanlder.init?.(instance)
  }
}
