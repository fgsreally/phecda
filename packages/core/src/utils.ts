export async function validate(
  p: RegExp | string | Function | Object | Number,
  v: any,
) {
  if (typeof p === 'string' || typeof p === 'number') {
    if (v === p)
      return true
  }

  if (typeof p === 'function')
    return (p as Function)(v)

  if (p instanceof RegExp)
    return p.test(v)

  return false
}

export function getTag<M extends new (...args: any) => any>(Model: M) {
  return (Model as any).prototype?._namespace?.__TAG__
}

export function mergeOptions(obj1: any, obj2?: any) {
  if (!obj2)
    return obj1

  for (const i in obj2) {
    if (isObject(obj1[i]) && isObject(obj2[i])) {
      mergeOptions(obj1[i], obj2[i])
      continue
    }
    if (Array.isArray(obj1[i]) && Array.isArray(obj2[i])) {
      obj1[i].push(...obj2[i].filter((item: any) => !obj1[i].includes(item)))
      continue
    }
    obj1[i] = obj2[i]
  }
  return obj1
}

function isObject(obj: any) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}
