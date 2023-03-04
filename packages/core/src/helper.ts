import { getExposeKey, getHandler, getIgnoreKey, getModelState } from './core'
import type { ClassValue, UsePipeOptions } from './types'
import { validate } from './utils'

export async function plainToClass<M extends new (...args: any) => any, Data extends Record<PropertyKey, any>>(Model: M, input: Data, options: Partial<UsePipeOptions> = {}) {
  const data: InstanceType<M> = new Model()
  const resolvedOptions = {
    collectError: true,
    transform: false,
    ...options,
  } as UsePipeOptions
  const err: string[] = []
  const stateVars = getModelState(data) as PropertyKey[]

  for (const item of stateVars) {
    data[item] = input[item]
    const handlers = getHandler(data, item)
    if (handlers) {
      // work for @Rule
      for (const handler of handlers) {
        const rule = handler.rule
        // const ret = await handler.rule?.(data)
        if (rule && !await validate(rule, data[item])) {
          err.push(handler.info || '')
          if (!resolvedOptions.collectError)
            break
        }
      }
      if (err.length > 0 && !resolvedOptions.transform)
        return { err, data }
      // work for @Pipe
      for (const handler of handlers)
        await handler.pipe?.(data)
    }
  }
  return { data, err }
}

export function classToValue<M>(instance: M): ClassValue<M> {
  const data = {} as any
  const exposeVar = getExposeKey(instance as any) as PropertyKey[]
  const ignoreVars = getIgnoreKey(instance as any) as PropertyKey[]

  for (const item of exposeVar) {
    if (ignoreVars.includes(item))
      continue
    data[item] = (instance as any)[item]
  }

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
 * add phecda-decorator to a class by function
 */
export function addDecoToClass<M extends new (...args: any) => any>(c: M, key: keyof InstanceType<M> | string, handler:((target: any, key: PropertyKey) => void), type: 'static' | 'class' | 'normal' = 'normal') {
  handler(type === 'normal' ? c.prototype : c, key)
}
