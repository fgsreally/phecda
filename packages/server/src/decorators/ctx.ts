import { SHARE_KEY, setMeta } from 'phecda-core'

export const Ctx: PropertyDecorator = (target: any, property: PropertyKey) => {
  setMeta(target, SHARE_KEY, undefined, {
    ctxs: [property],
  })
}

export function Define(key: string, value: any): any {
  return (target: any, property?: any, index?: number) => {
    if (typeof index === 'number') {
      setMeta(target, property, undefined, {
        params: [{ define: { [key]: value }, index }],
      })
    }
    else {
      setMeta(target, property, undefined, {
        define: {
          [key]: value,
        },
      })
    }
  }
}
