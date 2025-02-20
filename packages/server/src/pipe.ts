// import { isPhecda, } from 'phecda-core'
// import { ValidateException } from './exception/validate'

import type { PipeType } from './context'

export const defaultPipe: PipeType = ({ arg }) => {

  // if (['query', 'params'].includes(type) && reflect !== String) {
  //   if ([Object, Array].includes(reflect)) {
  //     return JSON.parse(arg)
  //   }
  //   if ([Number, Boolean].includes(reflect)) {
  //     return reflect(arg)
  //   }
  // }
  return arg
}
