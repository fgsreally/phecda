import { setMeta } from 'phecda-core'

export const Ctx: PropertyDecorator = (target: any, property: PropertyKey) => {
  setMeta(target, property, {
    ctx: true,
  })
}

export function Define(key: string, value: any): any {
  return (target: any, property?: any, index?: number) => {
    if (typeof index === 'number') {
      setMeta(target, property, {
        params: [{ define: { [key]: value }, index }],
      })
    }
    else {
      setMeta(target, property, {
        define: {
          [key]: value,
        },
      })
    }
  }
}
