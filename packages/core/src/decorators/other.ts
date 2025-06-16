// The following decorators are provided for  other packages and further usage
import { setMeta } from '../core'

export function Rule(...rules: ((value: any) => void | string | boolean | Promise<void | string | boolean>)[]) {
  return (target: any, property: PropertyKey, index?: any) => {
    setMeta(target, property, index, { rules })
  }
}

export function Required(target: any, property: PropertyKey, index?: any) {
  setMeta(target, property, index, { required: true })
}

export function Optional(target: any, property: PropertyKey, index?: any) {
  setMeta(target, property, index, { required: false })
}

export function Doc(doc: string) {
  return (target: any, property: PropertyKey, index?: any) => {
    setMeta(target, property, index, { doc })
  }
}



// export function Enum(data: object) {
//   return (target: any, property: PropertyKey, index?: any) => {
//     setMeta(target, property, index, {
//       rules: [
//         (value: any) => {
//           if (!Object.values(data).includes(value)) {
//             return `Value must be one of ${Object.values(data).join(', ')}`
//           }
//         }
//       ]
//     })
//   }
// }

