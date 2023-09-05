import { getExposeKey, getHandler, getModelState, getState } from './core'
import type { ClassValue, Phecda, UsePipeOptions } from './types'
import { validate } from './utils'

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

export async function plainToClass<M extends new (...args: any) => any, Data extends Record<PropertyKey, any>>(Model: M, input: Data, options: UsePipeOptions = {}) {
  const data: InstanceType<M> = new Model()
  const err: string[] = []
  const stateVars = getModelState(data) as PropertyKey[]
  for (const item of stateVars) {
    data[item] = input[item]

    const handlers = getHandler(data, item)
    if (handlers) {
      // work for @Rule
      if (options.collectError !== false) {
        for (const handler of handlers) {
          const rule = handler.rule
          const ret = await validate(rule, data[item])
          // 当rule为函数，且返回'ok'时，不会进行其他验证
          if (ret === 'ok')
            break
          if (rule && !ret) {
            err.push(typeof handler.info === 'function' ? handler.info(item) : handler.info)
            if (!options.collectError)
              break
          }
        }
      }
      if (err.length > 0 && !options.transform)
        return { err, data }
      // work for @Pipe
      if (options.transform !== false) {
        for (const handler of handlers)
          await handler.pipe?.(data)
      }
    }
  }
  return { data, err }
}

export function classToValue<M>(instance: M): ClassValue<M> {
  const data = {} as any
  const exposeVars = getExposeKey(instance as any) as PropertyKey[]
  for (const item of exposeVars)

    data[item] = (instance as any)[item]

  return data
}

export function to<T extends (...args: any) => any>(task: T, oldTasks?: Function[]) {
  const tasks: Function[] = oldTasks || []
  tasks.push(task)
  return { to: <R extends (arg: ReturnType<T>) => any>(task: R) => to<R>(task, tasks), value: tasks }
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
export function addDecoToClass<M extends new (...args: any) => any>(c: M, key: keyof InstanceType<M> | string, handler:((target: any, key: PropertyKey) => void), type: 'static' | 'class' | 'normal' = 'normal') {
  handler(type === 'normal' ? c.prototype : c, key)
}
