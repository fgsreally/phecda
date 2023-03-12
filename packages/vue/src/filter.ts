import { effectScope, reactive, ref } from 'vue'
import type { SchemaToObj } from './types'
export const EXPRESS_RE = /^{{(.*)}}$/
export const FN_RE = /^\[\[(.*)\]\]$/

export function createFilter<Data extends Record<string, any>>(
  initState: Object = {},
  option: { expressionRE?: RegExp;fnRE?: RegExp; exclude?: string[] } = {},
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

  function traverse(obj: any) {
    for (const i in obj) {
      if (Array.isArray(obj[i]) || resolveOption.exclude.includes(i))
        continue
      if (typeof obj[i] === 'object' && obj[i])
        traverse(obj[i])

      if (typeof obj[i] === 'string') {
        if (resolveOption.expressionRE.test(obj[i])) {
          const body = obj[i].match(resolveOption.expressionRE)[1]
          Object.defineProperty(obj, i, {
            get() {
              // eslint-disable-next-line no-new-func
              return new Function(...Object.keys(data.value), `return ${body}`)(
                ...Object.values(data.value),
              )
            },
          })
        }
        if (resolveOption.fnRE.test(obj[i])) {
          const body = obj[i].match(resolveOption.fnRE)[1]
          Object.defineProperty(obj, i, {
            get() {
              // eslint-disable-next-line no-new-func
              return new Function(...Object.keys(data.value), `${body}`)(
                ...Object.values(data.value),
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

  function clearStore(key: string) {
    delete store[key]
  }

  function dispose() {
    data = null as any
    store = null as any
    scope.stop()
  }
  return { filter, data, init, setState, storeState, store, applyStore, dispose, clearStore }
}
