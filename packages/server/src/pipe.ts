import { isPhecda, plainToClass, transformClass } from 'phecda-core'
import { ValidateException } from './exception/validate'

import type { P } from './types'

export const defaultPipe: P.Pipe = async ({ arg, reflect, index }: any) => {
  if (isPhecda(reflect)) {
    const instance = plainToClass(reflect, arg)
    const err = await transformClass(instance)
    if (err.length > 0)
      throw new ValidateException(err[0])

    arg = instance
  }
  else {
    if ([Number, Boolean].includes(reflect)) {
      arg = reflect(arg)

      if (reflect === Number && Object.is(arg, NaN))
        throw new ValidateException(`parameter ${Number(index) + 1} should be a number`)
    }
  }
  return arg
}
