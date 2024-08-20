/* eslint-disable no-prototype-builtins */
import type { Construct, Phecda } from './types'

// 有的时候，类上多个方法、属性需要共用一些东西
// SHARE_KEY就是共有数据存储的键值，所有key为可选的函数，key默认即SHARE_KEY
export const SHARE_KEY = Symbol('phecda[share]')
export const CLEAR_KEY = Symbol('phecda[clear]')

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
         * 元数据
        */
      __META__: new Map(),
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

// export function setExposeKey(proto: Phecda, property?: PropertyKey) {
//   if (!property) {
//     property = SHARE_KEY
//     proto = proto.prototype
//   }

//   init(proto)

//   proto[PHECDA_KEY].__EXPOSE_KEY__.add(property)
// }

// export function setIgnoreKey(proto: Phecda, property?: PropertyKey, index?: number) {
//   if (!property) {
//     property = SHARE_KEY
//     proto = proto.prototype
//   }
//   init(proto)
//   proto[PHECDA_KEY].__IGNORE_KEY__.add(property)
// }

// export function getOwnExposeKey(target: any) {
//   const proto: Phecda = getPhecdaFromTarget(target)

//   return [...proto[PHECDA_KEY].__EXPOSE_KEY__].filter(item => !proto[PHECDA_KEY].__IGNORE_KEY__.has(item)) as string[]
// }

// export function getExposeKey(target: any) {
//   let proto: Phecda = getPhecdaFromTarget(target)

//   const set = new Set<PropertyKey>()
//   const origin = proto
//   while (proto?.[PHECDA_KEY]) {
//     if (proto.hasOwnProperty(PHECDA_KEY))
//       [...proto[PHECDA_KEY].__EXPOSE_KEY__].forEach(item => !origin[PHECDA_KEY].__IGNORE_KEY__.has(item) && set.add(item))

//     proto = Object.getPrototypeOf(proto)
//   }
//   return [...set]
// }

// export function getOwnIgnoreKey(target: any) {
//   const proto: Phecda = getPhecdaFromTarget(target)

//   return [...proto[PHECDA_KEY]?.__IGNORE_KEY__] as string[]
// }

export function setMeta(proto: Phecda, property: PropertyKey | undefined, index: number | undefined, meta: Record<string, any>) {
  if (!property) {
    property = SHARE_KEY
    proto = proto.prototype
  }
  init(proto)
  if (!proto[PHECDA_KEY].__META__.has(property))
    proto[PHECDA_KEY].__META__.set(property, { data: [], params: new Map() })

  const oldMeta = proto[PHECDA_KEY].__META__.get(property)!

  if (typeof index === 'number') {
    if (!oldMeta.params.has(index))
      oldMeta.params.set(index, [])

    const paramsMeta = oldMeta.params.get(index)
    paramsMeta.push(meta)
  }
  else {
    oldMeta.data.push(meta)
  }

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

export function getOwnMetaParams(target: any, key: PropertyKey = SHARE_KEY) {
  const proto: Phecda = getPhecdaFromTarget(target)
  const { params } = proto[PHECDA_KEY].__META__.get(key)!
  return [...params.keys()]
}

export function getMetaParams(target: any, key: PropertyKey = SHARE_KEY) {
  let proto: Phecda = getPhecdaFromTarget(target)
  const set = new Set<number>()
  while (proto?.[PHECDA_KEY]) {
    if (proto.hasOwnProperty(PHECDA_KEY)) {
      const meta = proto[PHECDA_KEY].__META__.get(key)
      if (meta) {
        for (const index of meta.params.keys())
          set.add(index)
      }
    }

    proto = Object.getPrototypeOf(proto)
  }
  return [...set].sort((a, b) => a - b)
}

export function getMeta(target: any, property: PropertyKey = SHARE_KEY, index?: number) {
  let proto: Phecda = getPhecdaFromTarget(target)
  const ret: any[] = []
  while (proto?.[PHECDA_KEY]) {
    if (proto.hasOwnProperty(PHECDA_KEY)) {
      const meta = proto[PHECDA_KEY].__META__.get(property)!

      if (meta) {
        if (typeof index === 'number') {
          const paramMeta = meta.params.get(index)

          if (paramMeta) {
            ret.unshift(...paramMeta)
            if (paramMeta.some((item: any) => item[CLEAR_KEY]))
              break
          }
        }
        else {
          ret.unshift(...meta.data)
          if (meta.data.some((item: any) => item[CLEAR_KEY]))
            break
        }
      }
    }
    proto = Object.getPrototypeOf(proto)
  }

  return ret
}
export function getOwnMeta(target: any, property: PropertyKey = SHARE_KEY, index?: number): any[] {
  const proto: Phecda = getPhecdaFromTarget(target)
  const meta = proto[PHECDA_KEY].__META__.get(property)!
  return typeof index === 'number' ? meta.params.get(index) : meta.data
}

export function set(proto: any, property: string, value: any) {
  init(proto)
  proto[`__${property.toUpperCase()}__`] = value
}

export function get(proto: any, property: string) {
  return proto[`__${property.toUpperCase()}__`]
}
