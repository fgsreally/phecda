export function shallowClone(obj: any) {
  return { ...obj }
}
export function mergeObject(...args: any[]) {
  return Object.assign({}, ...args)
}
export function mergeArray(...args: any[]) {
  return args.filter(item => !!item).flat()
}
