import { Rule } from '../decorators'
export function isArray(info?: string) {
  return Rule(param => Array.isArray(param), info || 'it should be an array')
}

export function isBoolean(info?: string) {
  return Rule(param => [true, false].includes(param), info || 'it should be true or false')
}

export function isString(info?: string) {
  return Rule(param => typeof (param) === 'string', info || 'it should be a string')
}

export function isObject(info?: string) {
  return Rule((param) => {
    return Object.prototype.toString.call(param) === '[object Object]'
  }, info || 'it should be an object')
}
