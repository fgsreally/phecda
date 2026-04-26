import { extractDataByRules, extractRules, isPhecda, validateWithRules } from 'phecda-core'
import type { Construct, ExtractedRule } from 'phecda-core'
import type { PipeType } from './context'
import { ValidateException } from './exception'

const modelRulesCache = new WeakMap<Construct, ExtractedRule[]>()

function isPlainObject(value: any) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function convertForRequestInput(value: any, type: any, index: number) {
  if (value === undefined)
    return value

  if (type === Number && typeof value === 'string') {
    const num = Number(value)
    if (Number.isNaN(num))
      throw new ValidateException(`param ${index + 1} is not a number`)
    return num
  }

  if (type === Boolean && typeof value === 'string') {
    if (value === 'true')
      return true
    if (value === 'false')
      return false
    throw new ValidateException(`param ${index + 1} is not a boolean`)
  }

  return value
}

function isStrTypeParam(type: string) {
  return ['params', 'query', 'headers'].includes(type)
}

function convertExtractedDataByRules(data: any, rules: ExtractedRule[], index: number) {
  if (!data || typeof data !== 'object')
    return data

  for (const rule of rules) {
    if (!rule.property)
      continue
    if (rule.property.includes('.') || rule.property.includes('[]'))
      throw new ValidateException('default pipe only supports simple shallow phecda class for query/params/headers; please use custom pipe for nested data')

    data[rule.property] = convertForRequestInput(data[rule.property], rule.designType, index)
  }

  return data
}

function getModelRules(model: Construct) {
  const cached = modelRulesCache.get(model)
  if (cached)
    return cached

  const rules = extractRules(model)
  modelRulesCache.set(model, rules)
  return rules
}

async function validatePhecdaByRules(model: Construct, input: any, shouldConvert: boolean, index: number) {
  if (!isPlainObject(input))
    throw new ValidateException('data must be an object')

  const rules = getModelRules(model)
  let data = extractDataByRules(input, rules)
  if (shouldConvert)
    data = convertExtractedDataByRules(data, rules, index)

  const errs = await validateWithRules(data, rules)
  if (errs.length)
    throw new ValidateException(errs[0])

  return data
}

export const defaultPipe: PipeType = async ({ arg, reflect, meta, index, type, key }, { method }) => {
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

  const isModel = isPhecda(reflect)
  const isStrType = isStrTypeParam(type)
  const canUseShallowModelConvert = isStrType && !key

  if (isModel && isStrType && key) {
    throw new ValidateException('phecda class cannot be used with specified field in query/params/headers in default pipe')
  }

  if (!isModel && isStrType) {
    arg = convertForRequestInput(arg, reflect, index)
  }
  else if (!isModel) {
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
            try {
              await validatePhecdaByRules(item, arg, canUseShallowModelConvert, index)
              isCorrect = true
            }
            catch { }
            if (isCorrect)
              break
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

  if (isModel)
    arg = await validatePhecdaByRules(reflect, arg, canUseShallowModelConvert, index)

  return arg
}
