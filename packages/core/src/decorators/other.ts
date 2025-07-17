// The following decorators are provided for  other packages and further usage
import { setMeta } from '../core'

export function Doc(doc: string) {
  return (target: any, property: PropertyKey, index?: any) => {
    setMeta(target, property, index, { doc })
  }
}
