import type { Handler, Phecda } from './types'

export function isPhecda(model: any) {
  if (typeof model === 'function') {
    return !!model.prototype?._namespace
  }
  return false
}
// 一个类挂载第一个phecda装饰器时，会创建对应的，类似元数据的东西
export function init(model: Phecda) {
  if (!model)
    return
  // eslint-disable-next-line no-prototype-builtins
  if (!model.hasOwnProperty('_namespace')) {
    model._namespace = {

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

export function regisInitEvent(model: Phecda, key: string) {
  init(model)
  model._namespace.__INIT_EVENT__.add(key)
}

export function getOwnInitEvent(module: Phecda) {
  module=Object.getPrototypeOf(module)
  return [...module._namespace.__INIT_EVENT__] as string[]
}
export function getInitEvent(module: Phecda) {
  let proto: Phecda = Object.getPrototypeOf(module)
  const set = new Set<PropertyKey>()
  while (proto?._namespace) {
    proto._namespace.__INIT_EVENT__.forEach(item => set.add(item))

    proto = Object.getPrototypeOf(proto)
  }
  return [...set]
}

// it should be setmodelVar
export function setVar(proto: Phecda, key: PropertyKey) {
  init(proto)
  proto._namespace.__STATE_VAR__.add(key)
  // 绑定状态的值，均属于暴露的值
  setExposeKey(proto, key)
}

export function setExposeKey(proto: Phecda, key: PropertyKey) {
  init(proto)
  proto._namespace.__EXPOSE_VAR__.add(key)
}

export function setIgnoreKey(proto: Phecda, key: PropertyKey) {
  init(proto)
  proto._namespace.__IGNORE_VAR__.add(key)
}

// 存在状态的属性
export function getOwnModuleState(module: Phecda) {
  module = Object.getPrototypeOf(module)

  return [...module._namespace.__STATE_VAR__] as string[]
}

export function getModuleState(module: Phecda) {
  let proto: Phecda = Object.getPrototypeOf(module)
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
export function getOwnExposeKey(module: Phecda) {
  module = Object.getPrototypeOf(module) as Phecda
  return [...module._namespace.__EXPOSE_VAR__].filter(item => !module._namespace.__IGNORE_VAR__.has(item)) as string[]
}

export function getExposeKey(module: Phecda) {
  let proto = Object.getPrototypeOf(module)
  const set = new Set<PropertyKey>()
  while (proto?._namespace) {
    [...proto._namespace.__EXPOSE_VAR__].forEach(item => !proto._namespace.__IGNORE_VAR__.has(item) && set.add(item))

    proto = Object.getPrototypeOf(proto)
  }
  return [...set]
}

export function getOwnIgnoreKey(module: Phecda) {
  if (!module?._namespace)
    return []

  return [...module._namespace.__IGNORE_VAR__] as string[]
}

export function regisHandler(proto: Phecda, key: PropertyKey, handler: Handler) {
  init(proto)
  if (!proto._namespace.__STATE_HANDLER__.has(key))
    proto._namespace.__STATE_HANDLER__.set(key, [handler])
  else
    proto._namespace.__STATE_HANDLER__.get(key)!.push(handler)
}

export function getOwnHandler(module: Phecda, key: PropertyKey) {
  if (!module?._namespace)
    return []

  return module._namespace.__STATE_HANDLER__.get(key) || []
}

export function getHandler(module: Phecda, key: PropertyKey) {
  let proto: Phecda = Object.getPrototypeOf(module)
  const set = new Set<any>()
  while (proto?._namespace) {
    proto._namespace.__STATE_HANDLER__.get(key)?.forEach(item => set.add(item))
    proto = Object.getPrototypeOf(proto)
  }

  return [...set]
}

export function setState(proto: Phecda, key: PropertyKey, state: Record<string, any>) {
  init(proto)
  const namespace = proto._namespace.__STATE_NAMESPACE__

  namespace.set(key, state)
}
export function getOwnState(module: Phecda, key: PropertyKey) {
  module = Object.getPrototypeOf(module)
  return module._namespace.__STATE_NAMESPACE__.get(key) || {}
}

export function getState(module: Phecda, key: PropertyKey) {
  let proto: Phecda = Object.getPrototypeOf(module)
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
export function register(module: Phecda) {
  const stateVars = getExposeKey(module) as PropertyKey[]

  for (const item of stateVars) {
    const handlers = getHandler(module, item)

    for (const hanlder of handlers)
      hanlder.init?.(module)
  }
}

export async function registerAsync(module: Phecda) {
  const stateVars = getExposeKey(module) as PropertyKey[]

  for (const item of stateVars) {
    const handlers = getHandler(module, item)
    for (const hanlder of handlers)
      await hanlder.init?.(module)
  }
}
