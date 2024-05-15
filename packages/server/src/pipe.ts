import { isPhecda, plainToClass, transformInstance } from 'phecda-core'
import { ValidateException } from './exception/validate'

import type { PipeType } from './context'

export const defaultPipe: PipeType = ({ arg, reflect, index, defaultValue }) => {
  if (isPhecda(reflect)) {
    const instance = plainToClass(reflect, arg)
    const err = transformInstance(instance)
    if (err.length > 0)
      throw new ValidateException(err[0])

    arg = instance
  }
  else {
    if (arg === undefined && defaultValue !== undefined)
      return defaultValue

    if ([Number, Boolean].includes(reflect)) {
      arg = reflect(arg)

      if (reflect === Number && Object.is(arg, NaN))
        throw new ValidateException(`parameter ${Number(index) + 1} should be a number`)
    }
  }
  return arg
}
