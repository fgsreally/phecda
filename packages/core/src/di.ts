import type { InjectData } from './types'

// 用于自定义的情况，但不太推荐
export const DataMap = {} as InjectData

export function Provide<K extends keyof InjectData>(key: K, value: InjectData[K]) {
  DataMap[key] = value
}

export function Inject<K extends keyof InjectData>(key: K): InjectData[K] {
  return DataMap[key]
}

// 用于内部未实现的装饰器，如Watcher、Storage
export const activeInstance: Record<string, any> = {}
export function setInject(key: string, value: any) {
  activeInstance[key] = value
  return activeInstance
}

export function getInject(key: string) {
  return activeInstance[key]
}
