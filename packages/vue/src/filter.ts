/* eslint-disable no-new-func */
import { effectScope, ref } from 'vue'
import type { SchemaToObj } from './types'
export const RE = /{{(.*)}}/
// array won't be filtered
export function createFilter<Data extends Record<string, any>>(
  initState: Object = {},
  option: { RE?: RegExp; needReturn?: boolean; exclude?: string[]; errorHandler?: (error?: Error, errorPath?: string) => any } = {},
) {
  const resolveOption = Object.assign(
    {
      RE,
      exclude: [],
    },
    option,
  )
  const scope = effectScope(true)

  let data = scope.run(() => ref<Data>(initState as any))!
  let store: { [key: string]: Data } = {}

  function traverse(obj: any, path?: string) {
    for (const i in obj) {
      if (resolveOption.exclude.includes(i))
        continue

      const errorPath = path ? `${path}.${i}` : i
      if (typeof obj[i] === 'object' && obj[i])
        traverse(obj[i], errorPath)

      if (typeof obj[i] === 'string') {
        if (resolveOption.RE.test(obj[i])) {
          // @ts-expect-error miss type
          const body = obj[i].replace(resolveOption.RE, (_, s) => {
            return s
          })

          Object.defineProperty(obj, i, {
            get() {
              return new Function(...Object.keys(data.value), '_eh', resolveOption.errorHandler ? `try{${resolveOption.needReturn ? '' : 'return'} ${body}}catch(e){return _eh(e,"${errorPath}")}` : `${resolveOption.needReturn ? '' : 'return'} ${body}`)(
                ...Object.values(data.value), resolveOption.errorHandler,
              )
            },
            // only work when using variable(not expression)
            set(value) {
              try {
                new Function('_data', '_v', `_data.${body}=_v`)(
                  data.value, value,
                )
                return true
              }
              catch (e) {
                resolveOption.errorHandler?.(e as Error)
                return false
              }
            },
          })
        }
        // if (resolveOption.fnRE.test(obj[i])) {
        //   const body = obj[i].match(resolveOption.fnRE)[1]
        //   Object.defineProperty(obj, i, {
        //     get() {
        //       return new Function(...Object.keys(data.value), '_eh', resolveOption.errorHandler ? `try{${body}}catch(e){return _eh(e,"${errorPath}")}` : `${body}`)(
        //         ...Object.values(data.value), resolveOption.errorHandler,
        //       )
        //     },
        //   })
        // }
      }
    }
  }

  function filter<Schema>(obj: Schema): SchemaToObj<Schema> {
    traverse(obj)
    return obj
  }
  function setState<Key extends string>(key: Key, value: Data[Key]) {
    data.value[key] = value
  }

  function storeState(key: string, params?: Data) {
    store[key] = data.value
    init(params)
  }
  function applyStore(key: string) {
    if (!store[key])
      return
    data.value = store[key]
  }

  function init(params?: Data) {
    data.value = params || initState || {}
  }

  function delState(key: string) {
    delete data.value[key]
  }

  function clearStore(key: string) {
    delete store[key]
  }

  function dispose() {
    data = null as any
    store = null as any
    scope.stop()
  }
  return { filter, data, init, setState, storeState, store, applyStore, dispose, clearStore, delState }
}
