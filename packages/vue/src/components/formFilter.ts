import { createFilter } from '../filter'

export function createFormData<Schema extends object, Data extends object>(schema: Schema, initData: Data = {} as any, options: { expressionRE?: RegExp;fnRE?: RegExp; exclude?: string[] } = {}) {
  const { data, filter } = createFilter(initData, options)
  initlize(schema, data.value)
  const filterRet = filter<Schema>(schema)

  function initlize(obj1: any, obj2: any) {
    for (const i in obj1) {
      if (obj1[i]._default)
        obj2[i] = obj1[i]._default
    }
  }

  return { config: filterRet, data }
}
