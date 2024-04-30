/* eslint-disable new-cap */
import { SHARE_KEY, get, getExposeKey, getHandler, getState, getStateKey } from './core'
import type { AbConstruct, ClassValue, Construct, Phecda } from './types'

export function getTag<M extends Construct | AbConstruct>(moduleOrInstance: M | InstanceType<M>): PropertyKey {
  if (typeof moduleOrInstance === 'object')
    moduleOrInstance = (moduleOrInstance as InstanceType<M>).constructor

  return get(moduleOrInstance.prototype, 'tag') || (moduleOrInstance as M).name
}

export function getBind<M extends Construct | AbConstruct>(model: M) {
  // @ts-expect-error just get bind value
  const instance = new model() as Phecda
  const keys = getStateKey(instance) as PropertyKey[]
  const ret: any = {}
  for (const item of keys) {
    const state = getState(instance as any, item) as any

    if (state.value)
      ret[item] = state.value
  }
  return ret
}

export function plainToClass<M extends Construct, Data extends Record<PropertyKey, any>>(model: M, input: Data) {
  const instance: InstanceType<M> = new model()

  const keys = getExposeKey(instance) as PropertyKey[]
  for (const item of keys)

    instance[item] = input[item]

  return instance
}

// Actually not a good way
export function transformInstance<M extends Construct>(instance: InstanceType<M>, force = false) {
  const err: string[] = []
  const keys = getExposeKey(instance) as PropertyKey[]
  const addError = err.push.bind(err)

  for (const item of keys) {
    const handlers = getHandler(instance, item)
    if (handlers) {
      for (const handler of handlers) {
        const pipe = handler.pipe
        if (!pipe)
          continue
        pipe(instance, addError)

        if (err.length && !force)
          return err
      }
    }
  }
  return err
}

export async function transformInstanceAsync<M extends Construct>(instance: InstanceType<M>, force = false) {
  const err: string[] = []
  const keys = getExposeKey(instance) as PropertyKey[]
  const addError = err.push.bind(err)

  for (const item of keys) {
    const handlers = getHandler(instance, item)

    if (handlers) {
      for (const handler of handlers) {
        const pipe = handler.pipe
        if (!pipe)
          continue
        await pipe(instance, addError)

        if (err.length && !force)
          return err
      }
    }
  }
  return err
}

export function transformProperty<M extends Construct>(instance: InstanceType<M>, property: keyof InstanceType<M>, force = false) {
  const err: string[] = []
  const handlers = getHandler(instance, property)
  const addError = err.push.bind(err)
  if (handlers) {
    for (const handler of handlers) {
      const pipe = handler.pipe
      if (!pipe)
        continue

      pipe(instance, addError)

      if (err.length && !force)
        return err
    }
  }
  return err
}

export async function transformPropertyAsync<M extends Construct>(instance: InstanceType<M>, property: keyof InstanceType<M>, force = false) {
  const err: string[] = []
  const handlers = getHandler(instance, property)
  const addError = err.push.bind(err)
  if (handlers) {
    for (const handler of handlers) {
      const pipe = handler.pipe
      if (!pipe)
        continue

      await pipe(instance, addError)

      if (err.length && !force)
        return err
    }
  }
  return err
}

export function classToPlain<M>(instance: M): ClassValue<M> {
  const data = {} as any
  const exposeVars = getExposeKey(instance as any) as PropertyKey[]
  for (const item of exposeVars)
    data[item] = (instance as any)[item]

  return JSON.parse(JSON.stringify(data))
}

export function snapShot<T extends Construct>(data: InstanceType<T>) {
  const snap = {} as unknown as InstanceType<T>
  for (const i in data)
    snap[i] = data[i]

  return {
    data,
    clear() {
      for (const i in snap)
        delete data[i]
    },
    apply() {
      for (const i in snap)
        data[i] = snap[i]
    },
  }
}
/**
 * add decorator to a class by function
 */
export function addDecoToClass<M extends Construct | AbConstruct>(c: M, key: keyof InstanceType<M> | PropertyKey, handler: PropertyDecorator | ClassDecorator) {
  handler(key === SHARE_KEY ? c : c.prototype, key as any)
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
