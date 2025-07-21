import { SHARE_KEY, getMetaKey, isPhecda } from './core'
import { RuleArgs } from './decorators'
import { getMergedMeta } from './helper'
import { Construct } from './types'

export const _createErrorMessage = (type: string, { property, meta }: RuleArgs) => {
  switch (type) {
    case 'string':
      return `must be a string for "${property}"`
    case 'number':
      return `must be a number for "${property}"`
    case 'boolean':
      return `must be a boolean for "${property}"`
    case 'oneOf':
      return `must pass one of these validations for "${property}"`
    case 'min':
      return `must be greater than ${meta.min} for "${property}"`
    case 'max':
      return `must be less than ${meta.max} for "${property}"`
    case 'enum':
      return `must be one of ${Object.values(meta.enum).join(', ')} for "${property}"`
    case 'required':
      return `it is required for "${property}"`
    case 'object':
      return `must be an object for "${property}"`
    case 'array':
      return `must be an array for "${property}"`
    case 'stringArray':
      return `must be an array of strings for "${property}"`
    case 'numberArray':
      return `must be an array of numbers for "${property}"`
    case 'booleanArray':
      return `must be an array of booleans for "${property}"`
  }

  return `invalid value for "${property}"`
}

function isObject(value: any) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export async function validate(model: Construct,
  data: any,
  collectErrors = false,
  createErrMsg = _createErrorMessage) {
  async function parse(model: Construct, data: any) {
    const errors: any[] = []

    if (!isObject(data)) {
      errors.push('data must be an object')
      return errors
    }

    for (const key of getMetaKey(model)) {
      const meta = getMergedMeta(model, key)
      const property = (key === SHARE_KEY) ? '' : key as string
      const type = property === '' ? model : Reflect.getMetadata('design:type', model.prototype, key as string)

      const { rules = [], nested, oneOf, min, max, enum: enumMap, required } = meta
      const value = property === '' ? data : data?.[key]
      const allRules = [async (args: any) => {
        const { value } = args
        if (required === false && value === undefined)
          return true
        if (required !== false && value === undefined)
          return createErrMsg('required', args)
        if (type === String && typeof value !== 'string')
          return createErrMsg('string', args)
        if (type === Number && typeof value !== 'number')
          return createErrMsg('number', args)
        if (type === Boolean && typeof value !== 'boolean')
          return createErrMsg('boolean', args)
        if (type === Array) {
          if (!Array.isArray(value))
            return createErrMsg('array', args)
          if (!nested)
            return

          for (const i in value) {
            if (nested === String && typeof value[i] !== 'string')
              return createErrMsg('stringArray', args)
            if (nested === Number && typeof value[i] !== 'number')
              return createErrMsg('numberArray', args)
            if (nested === Boolean && typeof value[i] !== 'boolean')
              return createErrMsg('booleanArray', args)
            if (isPhecda(nested)) {
              if (!isObject(value[i]))
                return createErrMsg('object', { ...args, arrayIndex: i })

              const errs = await parse(nested, value[i])
              if (errs.length) {
                errors.push(errs[0])
                break
              }
            }
          }
        }
        else {
          if (nested && isPhecda(nested)) {
            if (!isObject(value))
              return createErrMsg('object', args)

            const errs = await parse(nested, value)
            if (errs.length)
              errors.push(errs[0])
          }
        }

        if (min) {
          if (typeof value === 'number' && value < min)
            return createErrMsg('min', args)
          if (typeof value === 'string' && value.length < min)
            return createErrMsg('min', args)
          if (Array.isArray(value) && value.length < min)
            return createErrMsg('min', args)
        }
        if (max) {
          if (typeof value === 'number' && value > max)
            return createErrMsg('max', args)
          if (typeof value === 'string' && value.length > max)
            return createErrMsg('max', args)
          if (Array.isArray(value) && value.length > max)
            return createErrMsg('max', args)
        }
        if (enumMap) {
          if (!Object.values(enumMap).includes(value))
            return createErrMsg('enum', args)
        }

        if (oneOf) {
          let isCorrect = false
          for (const modelOrRule of oneOf) {
            switch (modelOrRule) {
              case String:
                if (typeof value === 'string')
                  isCorrect = true
                break
              case Number:
                if (typeof value === 'number')
                  isCorrect = true
                break
              case Boolean:
                if (typeof value === 'boolean')
                  isCorrect = true
                break
              default:
                if (isPhecda(modelOrRule)) {
                  const errs = await validate(modelOrRule, value)
                  if (!errs.length) {
                    isCorrect = true
                    break
                  }
                }
                else if (typeof modelOrRule === 'function') {
                  const ret = await modelOrRule(args)
                  if (ret) {
                    isCorrect = true
                    break
                  }
                }
            }
          }

          if (!isCorrect)
            return createErrMsg('oneOf', args)
        }
      }, ...rules]

      const args: RuleArgs = {
        value,
        property,
        meta,
        model,
      }

      for (const rule of allRules) {
        const errMsg = await rule(args)
        if (errMsg === true)
          break
        if (errMsg) {
          errors.push(errMsg)
          break
        }
      }

      if (errors.length !== 0 && !collectErrors)
        break
    }

    return errors
  }

  return await parse(model, data)
}
