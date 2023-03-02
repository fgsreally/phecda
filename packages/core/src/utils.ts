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

export function isAsyncFunc(fn: Function) {
  return (fn as any)[Symbol.toStringTag] === 'AsyncFunction'
}
