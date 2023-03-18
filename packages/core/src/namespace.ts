export const activeInstance: any = {}

export function injectProperty(key: string, value: any) {
  activeInstance[key] = value
  return activeInstance
}
