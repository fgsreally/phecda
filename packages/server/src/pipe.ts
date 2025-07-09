// import { isPhecda, } from 'phecda-core'
// import { ValidateException } from './exception/validate'

import type { PipeType } from './context'
import { ValidateException } from './exception'

export const defaultPipe: PipeType = async ({ arg, reflect, rawMeta, index }) => {
  // validate
  if (rawMeta.required !== false && arg === undefined)
    throw new ValidateException(`param ${index} is required`)

  // transform for query and param(not undefined)
  if (arg !== undefined && [Number, Boolean, String].includes(reflect))
    arg = reflect(arg)

  if (rawMeta.rules) {
    for (const rule of rawMeta.rules) {
      let res = rule(arg)

      if (res instanceof Promise)
        res = await res

      if (typeof res === 'string')
        throw new ValidateException(res)

      if (res === false)
        throw new ValidateException(`validation failed for param ${index}`)
    }
  }

  return arg
}
