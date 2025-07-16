// import { isPhecda, } from 'phecda-core'
// import { ValidateException } from './exception/validate'

import { isPhecda, validate } from 'phecda-core'
import type { PipeType } from './context'
import { ValidateException } from './exception'

export const defaultPipe: PipeType = async ({ arg, reflect, meta, index }, { method }) => {


  if (arg === undefined) {
    if (meta.required === false) //Optional
      return arg
    else //Required
      throw new ValidateException(`param ${index + 1} is required`)
  }

  // transform for query and param(not undefined)
  if ([Number, Boolean, String].includes(reflect))
    arg = reflect(arg)

  if (reflect === Number && isNaN(arg))
    throw new ValidateException(`param ${index + 1} is not a number`)

  if (meta.rules) {
    for (const rule of meta.rules) {
      const err = await rule({
        value: arg,
        property: method,
        meta,
        model: reflect,
        index,
      })

      if (err.length > 0)
        throw new ValidateException(err[0])
    }
  }

  if (isPhecda(reflect)) {
    const errs = await validate(reflect, arg)
    if (errs.length)
      throw new ValidateException(errs[0])
  }

  return arg
}
