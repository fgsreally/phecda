import { watch } from 'vue'
import { createFilter } from '../filter'

export function createFormData<Schema extends object, Data extends object>(schema: Schema, initData: Data = {} as any, options: { expressionRE?: RegExp;fnRE?: RegExp; exclude?: string[] } = {}) {
  const { data, filter } = createFilter(initData, options)
  initlize(schema, data.value)
  const filterRet = filter<Schema>(schema)
  watchChange(schema, data.value)

  function initlize(obj1: any, obj2: any) {
    for (const i in obj1) {
      if ('_default' in obj1[i])
        obj2[i] = obj1[i]._default
    }
  }

  function watchChange(schema: any, data: any) {
    for (const i in schema) {
      if ('_active' in schema[i]) {
        watch(() => (filterRet as any)[i]._active, (n) => {
          if (n) {
            if ('_default' in schema[i])
              data[i] = schema[i]._default
          }
          else {
            delete data[i]
          }
        }, { immediate: true })
      }
    }
  }

  return { config: filterRet, data }
}
