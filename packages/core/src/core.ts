/* eslint-disable no-prototype-builtins */
import type { Construct, Phecda } from './types'

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
      __EXPOSE_KEY__: new Set(),
      /**
         * @Ignore 绑定的属性，
         * 某属性即使被捕捉，可被强行忽略，优先级最高
        */
      __IGNORE_KEY__: new Set(),
      /**
         * @Clear 绑定的属性，
         * 消除父类在该key上的state/handler
        */

      __CLEAR_KEY__: new Set(),

      /**
         * 元数据
        */
      __META__: new Map<PropertyKey, any[]>(),
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

export function setExposeKey(proto: Phecda, property?: PropertyKey) {
  if (!property) {
    property = SHARE_KEY
    proto = proto.prototype
  }
  init(proto)

  proto[PHECDA_KEY].__EXPOSE_KEY__.add(property)
}

export function setIgnoreKey(proto: Phecda, property?: PropertyKey) {
  if (!property) {
    property = SHARE_KEY
    proto = proto.prototype
  }
  init(proto)
  proto[PHECDA_KEY].__IGNORE_KEY__.add(property)
}

// 暴露的属性
// 存在状态必然暴露，反之未必，但expose可以被ignore，前者不行
// 一般而言用这个就行，某些特定情况，可用前一种
export function getOwnExposeKey(target: any) {
  const proto: Phecda = getPhecdaFromTarget(target)

  return [...proto[PHECDA_KEY].__EXPOSE_KEY__].filter(item => !proto[PHECDA_KEY].__IGNORE_KEY__.has(item)) as string[]
}

export function getExposeKey(target: any) {
  let proto: Phecda = getPhecdaFromTarget(target)

  const set = new Set<PropertyKey>()
  const origin = proto
  while (proto?.[PHECDA_KEY]) {
    if (proto.hasOwnProperty(PHECDA_KEY))
      [...proto[PHECDA_KEY].__EXPOSE_KEY__].forEach(item => !origin[PHECDA_KEY].__IGNORE_KEY__.has(item) && set.add(item))

    proto = Object.getPrototypeOf(proto)
  }
  return [...set]
}

export function getOwnIgnoreKey(target: any) {
  const proto: Phecda = getPhecdaFromTarget(target)

  return [...proto[PHECDA_KEY]?.__IGNORE_KEY__] as string[]
}

export function setMeta(proto: Phecda, property: PropertyKey | undefined, meta: Record<string, any>) {
  if (!property) {
    property = SHARE_KEY
    proto = proto.prototype
  }
  init(proto)
  setExposeKey(proto, property)
  const oldMeta = proto[PHECDA_KEY].__META__.get(property) || []

  oldMeta.push(meta)

  proto[PHECDA_KEY].__META__.set(property, oldMeta)
}

// 获得含有meta的键，不包括internal Meta
export function getOwnMetaKey(target: any) {
  const proto: Phecda = getPhecdaFromTarget(target)
  return [...proto[PHECDA_KEY].__META__.keys()]
}

export function getMetaKey(target: any) {
  let proto: Phecda = getPhecdaFromTarget(target)
  const set = new Set<PropertyKey>()
  while (proto?.[PHECDA_KEY]) {
    if (proto.hasOwnProperty(PHECDA_KEY)) {
      for (const property of proto[PHECDA_KEY].__META__.keys())
        set.add(property)
    }

    proto = Object.getPrototypeOf(proto)
  }
  return [...set]
}

export function getMeta(target: any, property: PropertyKey = SHARE_KEY) {
  let proto: Phecda = getPhecdaFromTarget(target)
  let ret: any[] = []
  while (proto?.[PHECDA_KEY]) {
    if (proto.hasOwnProperty(PHECDA_KEY)) {
      const meta = proto[PHECDA_KEY].__META__.get(property)

      if (meta)
        ret = [...meta, ...ret]

      if (proto[PHECDA_KEY].__CLEAR_KEY__.has(property))
        break
    }
    proto = Object.getPrototypeOf(proto)
  }

  return ret
}
export function getOwnMeta(target: any, property: PropertyKey = SHARE_KEY): Record<string, any> {
  const proto: Phecda = getPhecdaFromTarget(target)

  return proto[PHECDA_KEY].__META__.get(property) || []
}

export function set(proto: any, property: string, value: any) {
  init(proto)
  proto[`__${property.toUpperCase()}__`] = value
}

export function get(proto: any, property: string) {
  return proto[`__${property.toUpperCase()}__`]
}
