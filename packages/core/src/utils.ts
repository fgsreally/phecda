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
  return (Model as any).prototype?.__TAG__
}

// function isObject(obj: any) {
//   return Object.prototype.toString.call(obj) === '[object Object]'
// }
