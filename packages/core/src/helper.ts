import { CLEAR_KEY, get, getMeta, getMetaKey } from './core'
import type { AbConstruct, Construct } from './types'
import { Clear, Optional } from './decorators'

export function getTag<M extends Construct | AbConstruct>(moduleOrInstance: M | InstanceType<M>): PropertyKey {
  if (typeof moduleOrInstance === 'object')
    moduleOrInstance = (moduleOrInstance as InstanceType<M>).constructor

  return get(moduleOrInstance.prototype, 'tag') || (moduleOrInstance as M).name
}

/**
 * add decorator to a class by function
 */
export function addDecoToClass<M extends Construct | AbConstruct>(c: M, key: keyof InstanceType<M> | PropertyKey | undefined, handler: PropertyDecorator | ClassDecorator) {
  handler(key ? c.prototype : c, key as any)
}

export function Pipeline(...decos: ((...args: any) => void)[]) {
  return (...args: any) => {
    for (const d of decos)
      d(...args)
  }
}

export function isAsyncFunc(fn: Function) {
  return (fn as any)[Symbol.toStringTag] === 'AsyncFunction'
}

export function invoke(instance: any, key: string, ...params: any) {
  const metaKeys = getMetaKey(instance)
  return Promise.allSettled(metaKeys.map((k) => {
    return getMeta(instance, k)
  }).flat().filter((item: any) => typeof item[key] === 'function').map((item: any) => item[key](instance, ...params)))
    .then((res) => {
      res.filter(item => item.status === 'rejected').forEach((item) => {
        console.error(item.reason)
      })

      return res
    })
}

export function invokeInit(instance: any) {
  return instance.__PROMISE_SYMBOL__ = invoke(instance, 'init')
}

export function invokeUnmount(instance: any) {
  return instance.__PROMISE_SYMBOL__ = invoke(instance, 'unmount')
}

export function If(value: Boolean, ...decorators: (ClassDecorator[]) | (PropertyDecorator[]) | (ParameterDecorator[])) {
  if (value) {
    return (...args: any[]) => {
      // @ts-expect-error  parameters pass to decorators
      decorators.forEach(d => d(...args))
    }
  }

  return () => { }
}

export function getMergedMeta(target: any, property?: PropertyKey, index?: number, merger: (prev: any, cur: any) => any = defaultMerger) {
  const meta = getMeta(target, property, index)
  return meta.reduce((p, c) => {
    return merger(p, c)
  }, {})
}

function defaultMerger(prev: any, cur: any) {
  const newMeta: any = {}
  for (const key in prev) {
    if (key === CLEAR_KEY as any)
      continue

    newMeta[key] = prev[key]
  }

  for (const key in cur) {
    if (key === CLEAR_KEY as any)
      continue

    if (newMeta[key] && cur[key]) {
      if (Array.isArray(newMeta[key]) && Array.isArray(cur[key])) {
        const set = new Set(newMeta[key])
        cur[key].forEach((item: any) => {
          set.delete(item)
          set.add(item)
        })

        newMeta[key] = [...set]
      }
      else if (typeof newMeta[key] === 'object' && typeof cur[key] === 'object') {
        newMeta[key] = defaultMerger(newMeta[key], cur[key])
      }
      else { newMeta[key] = cur[key] }
    }
    else {
      newMeta[key] = cur[key]
    }
  }
  return newMeta
}

export function wait(...instances: InstanceType<Construct>[]) {
  return Promise.all(instances.map(i => i.__PROMISE_SYMBOL__))
}

export function objectToClass<Obj extends Record<string, any>>(obj: Obj): new () => Obj {
  return class {
    constructor() {
      Object.assign(this, obj)
    }
  } as any
}

export function functionToClass<Func extends (...args: any) => object>(fn: Func): new (...args: Parameters<Func>) => ReturnType<Func> {
  return class {
    prototype: object
    constructor(...args: any) {
      Object.setPrototypeOf(this, fn(...args))
    }
  } as any
}

export function omit<Class extends Construct, Key extends keyof InstanceType<Class>>(classFn: Class, ...properties: Key[]): Construct<Omit<InstanceType<Class>, Key>> {
  const newClass = class extends classFn {
    constructor(...args: any) {
      super(...args)
      properties.forEach((k: any) => {
        delete this[k]
      })
    }
  } as any

  getMetaKey(classFn).forEach((k) => {
    if (properties.includes(k as any))
      addDecoToClass(newClass, k, Clear)
  })

  return newClass
}

export function partial<Class extends Construct, Key extends keyof InstanceType<Class>>(classFn: Class, ...properties: Key[]): Construct<Partial<Pick<InstanceType<Class>, Key>> & Omit<InstanceType<Class>, Key>> {
  const newClass = class extends classFn {

  } as any

  getMetaKey(classFn).forEach((k) => {
    if (properties.includes(k as any))
      addDecoToClass(newClass, k, Optional)
  })

  return newClass
}

// @todo
// export function pick<Class extends Construct, Key extends keyof InstanceType<Class>>(classFn: Class, properties: Key[]): Construct<Omit<InstanceType<Class>, Key>> {
//   const newClass = class {
//     constructor(...args: any) {
//       // eslint-disable-next-line new-cap
//       const instance = new classFn(...args)

//       properties.forEach((k: any) => {
//         (this as any)[k] = instance[k]
//       })
//     }
//   } as any

//   getMetaKey(classFn).forEach((k) => {
//     if (properties.includes(k as any) || k === SHARE_KEY) {

//       setMeta(newClass, k, undefined, {
//         [CLEAR_KEY]: true,
//       })

//     }
//   })

//   return newClass
// }

// just type trick
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function override<Class extends Construct, Key extends keyof InstanceType<Class>>(classFn: Class, ...properties: Key[]): Construct<Omit<InstanceType<Class>, Key>> {
  return classFn as any
}
