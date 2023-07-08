/* eslint-disable no-new-func */
import { effectScope, reactive, ref } from 'vue'
import type { SchemaToObj } from './types'
export const EXPRESS_RE = /^{{(.*)}}$/
export const FN_RE = /^\[\[(.*)\]\]$/
// array won't be filtered
export function createFilter<Data extends Record<string, any>>(
  initState: Object = {},
  option: { expressionRE?: RegExp; fnRE?: RegExp; exclude?: string[]; errorHandler?: (error?: Error, errorPath?: string) => any } = {},
) {
  const resolveOption = Object.assign(
    {
      expressionRE: EXPRESS_RE,
      fnRE: FN_RE,
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
        if (resolveOption.expressionRE.test(obj[i])) {
          const body = obj[i].match(resolveOption.expressionRE)[1]

          Object.defineProperty(obj, i, {
            get() {
              return new Function(...Object.keys(data.value), '_eh', resolveOption.errorHandler ? `try{return ${body}}catch(e){return _eh(e,"${errorPath}")}` : `return ${body}`)(
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
                return false
              }
            },
          })
        }
        if (resolveOption.fnRE.test(obj[i])) {
          const body = obj[i].match(resolveOption.fnRE)[1]
          Object.defineProperty(obj, i, {
            get() {
              return new Function(...Object.keys(data.value), '_eh', resolveOption.errorHandler ? `try{${body}}catch(e){return _eh(e,"${errorPath}")}` : `${body}`)(
                ...Object.values(data.value), resolveOption.errorHandler,
              )
            },
          })
        }
      }
    }
  }

  function filter<Schema>(obj: Schema): SchemaToObj<Schema> {
    obj = reactive<any>(obj)
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
