import { isPhecda, plainToClass } from 'phecda-core'
import { ValidateException } from './exception/validate'

import type { P } from './types'

export const defaultPipe: P.Pipe = async (args: any[]) => {
  for (const i in args) {
    const { option, arg, reflect } = args[i]
    if (option === false)
      continue
    if (!reflect) {
      if (option && arg)
        args[i].arg = option(arg)

      continue
    }

    if (isPhecda(reflect)) {
      const ret = await plainToClass(reflect, arg, { transform: true })
      if (ret.err.length > 0)
        throw new ValidateException(ret.err[0])
      args[i].arg = ret.data
    }
    else {
      if ([Number, Boolean].includes(reflect)) {
        args[i].arg = reflect(arg)

        if (reflect === Number && Object.is(args[i].arg, NaN))
          throw new ValidateException(`parameter ${Number(i) + 1} should be a number`)
      }
    }
  }
  return args.map(item => item.arg)
}
