import { isPhecda, validate } from 'phecda-core'
import type { PipeType } from './context'
import { ValidateException } from './exception'

export const defaultPipe: PipeType = async ({ arg, reflect, meta, index, type }, { method }) => {
  if (meta.const) {
    if (arg !== meta.const)
      throw new ValidateException(`param ${index + 1} must be ${meta.const}`)
  }

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
    for (const item of meta.oneOf) {
      switch (item) {
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
          if (isPhecda(item)) {
            const errs = await validate(item, arg)
            if (!errs.length) {
              isCorrect = true
              break
            }
          }
          else if (typeof item === 'function') {
            const ret = await item(arg)
            if (ret) {
              isCorrect = true
              break
            }
          }
          else {
            if (arg === item) {
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
  }

  return arg
}
