import { Construct } from '../types'
import { setMeta } from '../core'

export interface RuleArgs {
  model: Construct
  property: string
  value: any
  /**
  * paramIndex work for params' @Rule
  */
  index?: number
  meta: any
}

export function Rule(...rules: ((args: RuleArgs) => void | string | any | true | Promise<void | string | any | true>)[]) {
  return (target: any, property?: PropertyKey, index?: any) => {
    setMeta(target, property, index, { rules })
  }
}

export function Required(target: any, property: PropertyKey, index?: any) {
  setMeta(target, property, index, { required: true })
}

export function Optional(target: any, property: PropertyKey, index?: any) {
  setMeta(target, property, index, { required: false })
}

export function Min(min: number) {
  return (target: any, property?: PropertyKey, index?: any) => {
    setMeta(target, property, index, { min })
  }
}

export function Max(max: number) {
  return (target: any, property?: PropertyKey, index?: any) => {
    setMeta(target, property, index, { max })
  }
}

export function Nested(model: Construct) {
  return (target: any, property: string, index?: any) => {
    setMeta(target, property, index, { nested: model })
  }
}

export function OneOf(...validations: (Construct | ((args: RuleArgs) => boolean | Promise<boolean>))[]) {
  return (target: any, property: string, index?: any) => {
    setMeta(target, property, index, { oneOf: validations })
  }
}

export function Enum(map: Record<string, any>) {
  return (target: any, property: string, index?: any) => {
    setMeta(target, property, index, { enum: map })
  }
}

export function Const(value: string | number | boolean | null | undefined) {
  return (target: any, property: string, index?: any) => {
    setMeta(target, property, index, { const: value })
  }
}
