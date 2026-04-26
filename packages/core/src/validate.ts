import { SHARE_KEY, getMetaKey, isPhecda } from './core'
import { RuleArgs } from './decorators'
import { getMergedMeta } from './helper'
import { Construct } from './types'

type PathKey = string | number

function parsePath(path: string) {
  if (!path)
    return []

  return path.split('.').flatMap((token) => {
    if (!token)
      return []
    if (token.endsWith('[]'))
      return [token.slice(0, -2), '[]']
    return [token]
  })
}

function collectConcretePathsByTokens(data: any, tokens: string[]): { keys: PathKey[]; value: any }[] {
  if (!tokens.length)
    return [{ keys: [], value: data }]

  const walk = (node: any, tokenIndex: number, keys: PathKey[]): { keys: PathKey[]; value: any }[] => {
    if (tokenIndex >= tokens.length)
      return [{ keys, value: node }]

    const token = tokens[tokenIndex]
    if (token === '[]') {
      if (!Array.isArray(node))
        return []

      return node.flatMap((item, idx) => walk(item, tokenIndex + 1, [...keys, idx]))
    }

    if (node === null || node === undefined)
      return []

    const nodeType = typeof node
    if (nodeType !== 'object' && nodeType !== 'function')
      return []

    return walk(node[token], tokenIndex + 1, [...keys, token])
  }

  return walk(data, 0, [])
}

function setByConcreteKeys(target: any, keys: PathKey[], value: any) {
  if (!keys.length)
    return value

  let node = target
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const isLast = i === keys.length - 1
    if (isLast) {
      node[key] = value
      break
    }

    const nextKey = keys[i + 1]
    if (node[key] === undefined)
      node[key] = typeof nextKey === 'number' ? [] : {}
    node = node[key]
  }

  return target
}
export const _createErrorMessage = (type: string, { property, meta }: RuleArgs) => {
  switch (type) {
    case 'const':
      return `must be ${meta.const} for "${property}"`
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

export interface ExtractedRule {
  property: string
  designType: any
  mergedMeta: any
  validate: (value: any) => Promise<string | undefined>
}

export function extractRules(
  model: Construct,
  createErrMsg = _createErrorMessage,
  equalFn = (a: any, b: any) => a === b,
  parentPath = '',
): ExtractedRule[] {
  const mergedRuleMap = new Map<string, {
    property: string
    designType: any
    mergedMeta: any
    validators: Array<(value: any) => Promise<string | undefined>>
  }>()

  const collect = (currentModel: Construct, currentPath: string) => {
    for (const key of getMetaKey(currentModel)) {
      const mergedMeta = getMergedMeta(currentModel, key)
      const baseProperty = key === SHARE_KEY ? '' : key as string
      const property = (baseProperty && currentPath) ? `${currentPath}.${baseProperty}` : (baseProperty || currentPath)
      const designType = baseProperty === '' ? currentModel : Reflect.getMetadata('design:type', currentModel.prototype, key as string)

      const ruleRunner = async (value: any): Promise<string | undefined> => {
        const { rules = [], nested, oneOf, min, max, enum: enumMap, required } = mergedMeta
        const args: RuleArgs = {
          value,
          property,
          meta: mergedMeta,
          model: currentModel,
        }
        const allRules = [async (localArgs: RuleArgs) => {
          const { value } = localArgs
          if ('const' in mergedMeta) {
            if (!equalFn(value, mergedMeta.const))
              return createErrMsg('const', localArgs)
          }

          if (required === false && value === undefined)
            return true
          if (required !== false && value === undefined)
            return createErrMsg('required', localArgs)
          if (designType === String && typeof value !== 'string')
            return createErrMsg('string', localArgs)
          if (designType === Number && typeof value !== 'number')
            return createErrMsg('number', localArgs)
          if (designType === Boolean && typeof value !== 'boolean')
            return createErrMsg('boolean', localArgs)
          if (designType === Array) {
            if (!Array.isArray(value))
              return createErrMsg('array', localArgs)
            if (!nested)
              return

            for (const i in value) {
              if (nested === String && typeof value[i] !== 'string')
                return createErrMsg('stringArray', localArgs)
              if (nested === Number && typeof value[i] !== 'number')
                return createErrMsg('numberArray', localArgs)
              if (nested === Boolean && typeof value[i] !== 'boolean')
                return createErrMsg('booleanArray', localArgs)
              if (isPhecda(nested)) {
                if (!isObject(value[i]))
                  return createErrMsg('object', { ...localArgs, arrayIndex: i } as any)
              }
            }
          }
          else if (nested && isPhecda(nested)) {
            if (!isObject(value))
              return createErrMsg('object', localArgs)
          }

          if (min) {
            if (typeof value === 'number' && value < min)
              return createErrMsg('min', localArgs)
            if (typeof value === 'string' && value.length < min)
              return createErrMsg('min', localArgs)
            if (Array.isArray(value) && value.length < min)
              return createErrMsg('min', localArgs)
          }
          if (max) {
            if (typeof value === 'number' && value > max)
              return createErrMsg('max', localArgs)
            if (typeof value === 'string' && value.length > max)
              return createErrMsg('max', localArgs)
            if (Array.isArray(value) && value.length > max)
              return createErrMsg('max', localArgs)
          }
          if (enumMap) {
            if (!Object.values(enumMap).includes(value))
              return createErrMsg('enum', localArgs)
          }

          if (oneOf) {
            let isCorrect = false
            for (const item of oneOf) {
              switch (item) {
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
                  if (isPhecda(item)) {
                    const errs = await validate(item, value)
                    if (!errs.length) {
                      isCorrect = true
                      break
                    }
                  }
                  else if (typeof item === 'function') {
                    const ret = await item(localArgs)
                    if (ret) {
                      isCorrect = true
                      break
                    }
                  }
                  else if (equalFn(value, item)) {
                    isCorrect = true
                    break
                  }
              }
            }

            if (!isCorrect)
              return createErrMsg('oneOf', localArgs)
          }
        }, ...rules]

        for (const rule of allRules) {
          const errMsg = await rule(args)
          if (errMsg === true)
            return
          if (errMsg)
            return errMsg
        }
      }

      const current = mergedRuleMap.get(property)
      if (!current) {
        mergedRuleMap.set(property, {
          property,
          designType,
          mergedMeta,
          validators: [ruleRunner],
        })
      }
      else {
        current.validators.push(ruleRunner)
      }

      if (mergedMeta.nested && isPhecda(mergedMeta.nested)) {
        const nestedPath = designType === Array ? `${property}[]` : property
        collect(mergedMeta.nested, nestedPath)
      }
    }
  }

  collect(model, parentPath)

  return [...mergedRuleMap.values()].map(item => ({
    property: item.property,
    designType: item.designType,
    mergedMeta: item.mergedMeta,
    validate: async (value: any) => {
      for (const validator of item.validators) {
        const err = await validator(value)
        if (err)
          return err
      }
    },
  }))
}

export function extractDataByRules(
  data: any,
  rules: ExtractedRule[],
) {
  let transformed: any = {}

  const projectContainerOnly = (value: any, rule: ExtractedRule) => {
    const nested = rule.mergedMeta?.nested
    if (!nested || !isPhecda(nested))
      return value

    if (rule.designType === Array)
      return Array.isArray(value) ? [] : value

    return isObject(value) ? {} : value
  }

  for (const rule of rules) {
    if (!rule.property)
      continue
    const tokens = parsePath(rule.property)
    const concreteValues = collectConcretePathsByTokens(data, tokens)
    for (const concrete of concreteValues) {
      const projectedValue = projectContainerOnly(concrete.value, rule)
      transformed = setByConcreteKeys(transformed, concrete.keys, projectedValue)
    }
  }

  return transformed
}

export async function validateWithRules(
  data: any,
  rules: ExtractedRule[],
  collectErrors = false,
) {
  const errors: string[] = []
  for (const rule of rules) {
    if (!rule.property) {
      const err = await rule.validate(data)
      if (err) {
        errors.push(err)
        if (!collectErrors)
          break
      }
      continue
    }

    const tokens = parsePath(rule.property)
    const values = collectConcretePathsByTokens(data, tokens).map(v => v.value)
    const targetValues = values.length
      ? values
      : (tokens.length === 1 ? [undefined] : [])
    for (const value of targetValues) {
      const err = await rule.validate(value)
      if (err) {
        errors.push(err)
        break
      }
    }

    if (errors.length && !collectErrors)
      break
  }

  return errors
}

export async function validate(model: Construct,
  data: any,
  collectErrors = false,
  createErrMsg = _createErrorMessage,
  equalFn = (a: any, b: any) => a === b,
) {
  const errors: string[] = []

  if (!isObject(data)) {
    errors.push('data must be an object')
    return errors
  }

  const rules = extractRules(model, createErrMsg, equalFn)
  return await validateWithRules(data, rules, collectErrors)
}
