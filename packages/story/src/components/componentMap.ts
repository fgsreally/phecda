export const componentMap = {
  string: ElInput,
  number: ElInputNumber,

} as Record<string, any>

export function getComponentMap() {
  return componentMap
}
