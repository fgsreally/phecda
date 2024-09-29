export function shallowClone(obj: any) {
  return { ...obj }
}
export function mergeObject(...args: any[]) {
  return Object.assign({}, ...args)
}
