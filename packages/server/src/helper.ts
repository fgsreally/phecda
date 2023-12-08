export function resolveDep(ret: any, key: string) {
  if (key)
    return ret?.[key]
  return ret
}
