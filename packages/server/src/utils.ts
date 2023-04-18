export const isUndefined = (obj: any): obj is undefined =>
  typeof obj === 'undefined'
export const isNil = (obj: any): obj is null | undefined =>
  isUndefined(obj) || obj === null

export const isObject = (fn: any): fn is object =>
  !isNil(fn) && typeof fn === 'object'

export function resolveDep(ret: any, key: string) {
  if (key)
    return ret?.[key]
  return ret
}

/**
 * @experiment
 */
export class Wrap<F, T> {
  constructor(public v1: F,
    public V2: T) {

  }

  get value() {
    return this.V2
  }
}
