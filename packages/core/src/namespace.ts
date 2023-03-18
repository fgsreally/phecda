export const activeInstance: Record<string, any> = {}

export function injectProperty(key: string, value: any) {
  activeInstance[key] = value
  return activeInstance
}

export function getProperty(key: string) {
  return activeInstance[key]
}
