/* eslint-disable prefer-spread */
export function wrapError(target: any, key: PropertyKey, errorHandler: Function) {
  if (isAsyncFunc(target[key])) {
    return (...args: any) => {
      return target[key].apply(target, args).catch(errorHandler)
    }
  }
  else {
    return (...args: any) => {
      try {
        return target[key].apply(target, args)
      }
      catch (e) {
        return errorHandler(e)
      }
    }
  }
}

export function isAsyncFunc(fn: Function) {
  return (fn as any)[Symbol.toStringTag] === 'AsyncFunction'
}
