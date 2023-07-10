import { isPhecda, plainToClass } from 'phecda-core'
import { ValidateException } from './exception/validate'

import type { P } from './types'

export const defaultPipe = {
  // todo: add more params
  async transform(args: { arg: any; validate: boolean }[], reflect: any[]) {
    for (const i in args) {
      const { validate, arg } = args[i]
      if (validate === false || !reflect[i]/** work for undefined */)
        continue

      if (isPhecda(reflect[i])) {
        const ret = await plainToClass(reflect[i], arg, { transform: true })
        if (ret.err.length > 0)
          throw new ValidateException(ret.err[0])
        args[i].arg = ret.data
      }
      else {
        if (typeof args[i].arg === 'string') {
          // only parse when reflect is array(like:number[],[number,number])
          if (reflect[i] === Array) {
            try {
              args[i].arg = JSON.parse(args[i].arg)
            }
            catch (e) {
              throw new ValidateException(`parameter ${Number(i) + 1} can\'t be transformed correctly`)
            }
            continue
          }
          // json parse can transform string to boolean/number
          args[i].arg = reflect[i](arg)

          if (reflect[i] === Number && Object.is(args[i].arg, NaN))
            throw new ValidateException(`parameter ${Number(i) + 1} should be a number`)
        }
      }
    }
    return args.map(item => item.arg)
  },
} as P.Pipe
