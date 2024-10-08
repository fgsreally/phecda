import { CLEAR_KEY, get, getMeta, getMetaKey } from './core'
import type { AbConstruct, Construct } from './types'

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
