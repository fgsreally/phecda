import { get, getMeta, getMetaKey } from './core'
import type { AbConstruct, Construct } from './types'

export function getTag<M extends Construct | AbConstruct>(moduleOrInstance: M | InstanceType<M>): PropertyKey {
  if (typeof moduleOrInstance === 'object')
    moduleOrInstance = (moduleOrInstance as InstanceType<M>).constructor

  return get(moduleOrInstance.prototype, 'tag') || (moduleOrInstance as M).name
}

// Actually not a good way
// export function transformInstance<M extends Construct>(instance: InstanceType<M>, force = false) {
//   const err: string[] = []
//   const keys = getExposeKey(instance) as PropertyKey[]
//   const addError = err.push.bind(err)

//   for (const item of keys) {
//     const handlers = getHandler(instance, item)
//     if (handlers) {
//       for (const handler of handlers) {
//         const pipe = handler.pipe
//         if (!pipe)
//           continue
//         pipe(instance, addError)

//         if (err.length && !force)
//           return err
//       }
//     }
//   }
//   return err
// }

// export async function transformInstanceAsync<M extends Construct>(instance: InstanceType<M>, force = false) {
//   const err: string[] = []
//   const keys = getExposeKey(instance) as PropertyKey[]
//   const addError = err.push.bind(err)

//   for (const item of keys) {
//     const handlers = getHandler(instance, item)

//     if (handlers) {
//       for (const handler of handlers) {
//         const pipe = handler.pipe
//         if (!pipe)
//           continue
//         await pipe(instance, addError)

//         if (err.length && !force)
//           return err
//       }
//     }
//   }
//   return err
// }

// export function transformProperty<M extends Construct>(instance: InstanceType<M>, property: keyof InstanceType<M>, force = false) {
//   const err: string[] = []
//   const handlers = getHandler(instance, property)
//   const addError = err.push.bind(err)
//   if (handlers) {
//     for (const handler of handlers) {
//       const pipe = handler.pipe
//       if (!pipe)
//         continue

//       pipe(instance, addError)

//       if (err.length && !force)
//         return err
//     }
//   }
//   return err
// }

// export async function transformPropertyAsync<M extends Construct>(instance: InstanceType<M>, property: keyof InstanceType<M>, force = false) {
//   const err: string[] = []
//   const handlers = getHandler(instance, property)
//   const addError = err.push.bind(err)
//   if (handlers) {
//     for (const handler of handlers) {
//       const pipe = handler.pipe
//       if (!pipe)
//         continue

//       await pipe(instance, addError)

//       if (err.length && !force)
//         return err
//     }
//   }
//   return err
// }

// export function classToPlain<M>(instance: M): ClassValue<M> {
//   const data = {} as any
//   const exposeVars = getExposeKey(instance as any) as PropertyKey[]
//   for (const item of exposeVars)
//     data[item] = (instance as any)[item]

//   return JSON.parse(JSON.stringify(data))
// }

// export function snapShot<T extends Construct>(data: InstanceType<T>) {
//   const snap = {} as unknown as InstanceType<T>
//   for (const i in data)
//     snap[i] = data[i]

//   return {
//     data,
//     clear() {
//       for (const i in snap)
//         delete data[i]
//     },
//     apply() {
//       for (const i in snap)
//         data[i] = snap[i]
//     },
//   }
// }
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
  for (const key in prev)
    newMeta[key] = prev[key]
  for (const key in cur) {
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
