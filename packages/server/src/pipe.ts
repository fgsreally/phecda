import { isPhecda, plainToClass } from 'phecda-core'
import { ValidateException } from './exception/validate'

export interface Ppipe {
  transform(args: { arg: any; validate: boolean }[], reflect: any[]): Promise<any[]>
}

export const defaultPipe = {
  async transform(args: { arg: any; validate: boolean }[], reflect: any[]) {
    for (const i in args) {
      const { validate, arg } = args[i]
      if (validate && !(arg?.constructor === reflect[i])) {
        throw new ValidateException(`${arg} is not ${reflect[i].name}`)
      }
      else {
        if (isPhecda(reflect[i])) {
          const ret = await plainToClass(reflect[i], arg)
          if (ret.err.length > 0)
            throw new ValidateException(ret.err[0])
        }
      }
    }
    return args.map(item => item.arg)
  },
} as Ppipe
