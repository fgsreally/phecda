import { getExposeKey, getHandler, getModelState, getState } from './core'
import type { ClassValue, Phecda } from './types'
// from class
export function getTag<M extends new (...args: any) => any>(Model: M) {
  return (Model as any).prototype?.__TAG__
}
// from instance
export function getSymbol<M extends new (...args: any) => any>(instance: InstanceType<M>) {
  const Model = instance.constructor
  return getTag(Model) || Model.name
}

export function getBind<M extends new (...args: any) => any>(Model: M) {
  const instance = new Model() as Phecda
  const keys = getModelState(instance) as PropertyKey[]
  const ret: any = {}
  for (const item of keys) {
    const state = getState(instance as any, item) as any

    if (state.value)
      ret[item] = state.value
  }
  return ret
}

export function plainToClass<M extends new (...args: any) => any, Data extends Record<PropertyKey, any>>(Model: M, input: Data) {
  const instance: InstanceType<M> = new Model()

  const keys = getExposeKey(instance) as PropertyKey[]
  for (const item of keys)
    instance[item] = input[item]
  return instance
}

export async function transformClass<M extends new (...args: any) => any>(instance: InstanceType<M>, force = false) {
  const err: string[] = []

  const stateVars = getModelState(instance) as PropertyKey[]
  for (const item of stateVars) {
    const handlers = getHandler(instance, item)
    if (handlers) {
      for (const handler of handlers) {
        const pipe = handler.pipe

        try {
          await pipe(instance)
        }
        catch (e) {
          err.push((e as Error).message)
          if (!force)
            return err
        }
      }
    }
  }
  return err
}

export function classToValue<M>(instance: M): ClassValue<M> {
  const data = {} as any
  const exposeVars = getExposeKey(instance as any) as PropertyKey[]
  for (const item of exposeVars)

    data[item] = (instance as any)[item]

  return data
}

export function snapShot<T extends new (...args: any) => any>(data: InstanceType<T>) {
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
export function addDecoToClass<M extends new (...args: any) => any>(c: M, key: keyof InstanceType<M> | string, handler: ((target: any, key: PropertyKey) => void), type: 'static' | 'class' | 'normal' = 'normal') {
  handler(type === 'normal' ? c.prototype : c, key)
}

export function Pipeline(...decos: ((...args: any) => void)[]) {
  return (...args: any) => {
    for (const d of decos)
      d(...args)
  }
}
