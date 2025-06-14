// import { isPhecda, } from 'phecda-core'
// import { ValidateException } from './exception/validate'

import type { PipeType } from './context'
import { ValidateException } from './exception'

export const defaultPipe: PipeType = async ({ arg, reflect, rawMeta }) => {
  // if (['query', 'params'].includes(type) && reflect !== String) {
  //   if ([Object, Array].includes(reflect)) {
  //     return JSON.parse(arg)
  //   }
  if ([Number, Boolean, String].includes(reflect)) {
    return reflect(arg)
  }
  if (rawMeta.required && arg === undefined) {
    throw new ValidateException(`param is required`)
  }

  if (rawMeta.rule) {
    const res = await rawMeta.rule(arg)
    if (res) {
      throw new ValidateException(res)
    }
  }

  // }
  return arg
}
