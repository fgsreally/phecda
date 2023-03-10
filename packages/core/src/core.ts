import type { Phecda, PhecdaHandler } from './types'

// 一个类挂载第一个phecda装饰器时，会创建对应的，类似元数据的东西
export function init(target: Phecda) {
  if (!target._namespace) {
    target._namespace = {
      /**
         * 类的 @tag
        */
      __TAG__: '',
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
        */
      __STATE_VAR__: new Set(),
      /**
         * 状态变量的处理器
        */
      __STATE_HANDLER__: new Map(),
    }
  }
}

export function regisInitEvent(target: Phecda, key: string) {
  init(target)
  target._namespace.__INIT_EVENT__.add(key)
}

export function getInitEvent(target: Phecda) {
  init(target)
  return [...target._namespace.__INIT_EVENT__] as string[]
}

export function setModalState(target: Phecda, key: PropertyKey) {
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

export function getModelState(target: Phecda) {
  init(target)
  return [...target._namespace.__STATE_VAR__] as string[]
}

export function getExposeKey(target: Phecda) {
  init(target)
  return [...target._namespace.__EXPOSE_VAR__] as string[]
}

export function getIgnoreKey(target: Phecda) {
  init(target)
  return [...target._namespace.__IGNORE_VAR__] as string[]
}

export function regisHandler(target: Phecda, key: PropertyKey, handler: PhecdaHandler) {
  init(target)
  if (!target._namespace.__STATE_HANDLER__.has(key))
    target._namespace.__STATE_HANDLER__.set(key, [handler])

  else
    target._namespace.__STATE_HANDLER__.get(key)!.push(handler)
}

export function getHandler(target: Phecda, key: PropertyKey) {
  return target._namespace.__STATE_HANDLER__.get(key) || []
}

export function register(instance: Phecda) {
  const stateVars = getModelState(instance) as PropertyKey[]

  for (const item of stateVars) {
    const handlers = getHandler(instance, item)
    for (const hanlder of handlers)
      hanlder.init?.(instance)
  }
}
