/* eslint-disable new-cap */
import { getExposeKey, getHandler, getModuleState, getState } from './core'
import type { ClassValue, Construct, Phecda } from './types'
// from class
export function getTag<M extends Construct>(moduleOrInstance: M | InstanceType<M>): string | symbol {
  if (typeof moduleOrInstance === 'object')
    moduleOrInstance = (moduleOrInstance as InstanceType<M>).constructor

  return (moduleOrInstance as M).prototype?.__TAG__ || (moduleOrInstance as M).name
}

export function getBind<M extends Construct>(module: M) {
  const instance = new module() as Phecda
  const keys = getModuleState(instance) as PropertyKey[]
  const ret: any = {}
  for (const item of keys) {
    const state = getState(instance as any, item) as any

    if (state.value)
      ret[item] = state.value
  }
  return ret
}

export function plainToClass<M extends Construct, Data extends Record<PropertyKey, any>>(module: M, input: Data) {
  const instance: InstanceType<M> = new module()

  const keys = getExposeKey(instance) as PropertyKey[]
  for (const item of keys)
    instance[item] = input[item]
  return instance
}

export async function transformClass<M extends Construct>(instance: InstanceType<M>, force = false) {
  const err: string[] = []

  const stateVars = getModuleState(instance) as PropertyKey[]
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
export function addDecoToClass<M extends Construct>(c: M, key: keyof InstanceType<M> | string, handler: ((target: any, key: PropertyKey) => void), type: 'property' | 'class' = 'class') {
  handler(type === 'class' ? c.prototype : c, key)
}

export function Pipeline(...decos: ((...args: any) => void)[]) {
  return (...args: any) => {
    for (const d of decos)
      d(...args)
  }
}
