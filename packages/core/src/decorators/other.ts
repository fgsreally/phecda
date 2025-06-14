// The following decorators are provided for  other packages and further usage
import { setMeta } from '../core'

export function Rule(...rules: ((value: any) => void | string | Promise<void | string>)[]) {
  return (target: any, property: PropertyKey) => {
    setMeta(target, property, undefined, { rules })
  }
}

export function Required(target: any, property: PropertyKey) {
  setMeta(target, property, undefined, { required: true })
}

export function Optional(target: any, property: PropertyKey) {
  setMeta(target, property, undefined, { required: false })
}


export function Doc(doc: string) {
  return (target: any, property: PropertyKey, index?: number) => {
    setMeta(target, property, index, { doc })
  }
}
