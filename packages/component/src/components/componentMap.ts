export const componentMap = {} as Record<string, any>

export function getComponentMap() {
  return componentMap
}

export function initCompMap() {
  componentMap.string = ElInput
  componentMap.number = ElInputNumber
}
