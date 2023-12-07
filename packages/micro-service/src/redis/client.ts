import type { P } from 'phecda-server'

export function createClient<S extends Record<string, any>>(meta: P.Meta[]) {
  const metaRecord = {}

  for (const item of meta) {
    if (!metaRecord[item.tag]) {
      metaRecord[item.tag] = new Proxy({}, {
        get(_t, p, receiver) {
          return () => {

          }
        },
      })
    }
  }

  return metaRecord as S
}
