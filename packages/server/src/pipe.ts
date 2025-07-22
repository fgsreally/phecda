// import { isPhecda, } from 'phecda-core'
// import { ValidateException } from './exception/validate'

import { isPhecda, validate } from 'phecda-core'
import type { PipeType } from './context'
import { ValidateException } from './exception'

export const defaultPipe: PipeType = async ({ arg, reflect, meta, index, type }, { method }) => {
  if (arg === undefined) {
    if (meta.required === false) // Optional
      return arg
    else // Required
      throw new ValidateException(`param ${index + 1} is required`)
  }

  // transform for query and param(not undefined)

  if (['params', 'query'].includes(type)) {
    if (reflect === Number) {
      arg = reflect(arg)

      if (isNaN(arg))
        throw new ValidateException(`param ${index + 1} is not a number`)
    }
    else if (reflect === Boolean) {
      if (arg === 'false')
        arg = false
      else if (arg === 'true')
        arg = true
      else
        throw new ValidateException(`param ${index + 1} is not a boolean`)
    }
  }
  else {
    if (reflect === Number && typeof arg !== 'number')

      throw new ValidateException(`param ${index + 1} is not a number`)

    if (reflect === Boolean && typeof arg !== 'boolean')

      throw new ValidateException(`param ${index + 1} is not a boolean`)

    if (reflect === String && typeof arg !== 'string')

      throw new ValidateException(`param ${index + 1} is not a string`)
  }

  if (meta.enum) {
    if (!Object.values(meta.enum).includes(arg))
      throw new ValidateException(`param ${index + 1} is not a valid enum value`)
  }

  if (meta.oneOf) {
    let isCorrect = false
    for (const modelOrRule of meta.oneOf) {
      switch (modelOrRule) {
        case String:
          if (typeof arg === 'string')
            isCorrect = true
          break
        case Number:
          if (typeof arg === 'number')
            isCorrect = true
          break
        case Boolean:
          if (typeof arg === 'boolean')
            isCorrect = true
          break
        default:
          if (isPhecda(modelOrRule)) {
            const errs = await validate(modelOrRule, arg)
            if (!errs.length) {
              isCorrect = true
              break
            }
          }
          else if (typeof modelOrRule === 'function') {
            const ret = await modelOrRule(arg)
            if (ret) {
              isCorrect = true
              break
            }
          }
      }
    }

    if (!isCorrect)
      throw new ValidateException(`param ${index + 1} can't pass one of these validations`)
  }

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

    arg = Object.assign(new reflect(), arg)
  }

  return arg
}
