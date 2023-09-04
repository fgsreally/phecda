import { Rule } from '../decorators'
export function isArray(info?: string) {
  return Rule((param: any) => Array.isArray(param), info || (k => `'${k}' should be an array`))
}

export function isBoolean(info?: string) {
  return Rule((param: any) => [true, false].includes(param), info || (k => `'${k}' should be boolean`))
}

export function isNumber(info?: string) {
  return Rule((param: any) => typeof param === 'number', info || (k => `'${k}' should be number`))
}

export function isString(info?: string) {
  return Rule((param: any) => typeof (param) === 'string', info || (k => `'${k}' should be a string`))
}

export function isObject(info?: string) {
  return Rule((param: any) => {
    return Object.prototype.toString.call(param) === '[object Object]'
  }, info || (k => `'${k}' should be an object`))
}

export function isMobile(info?: string) {
  return Rule(/^((\+|00)86)?1((3[\d])|(4[5,6,7,9])|(5[0-3,5-9])|(6[5-7])|(7[0-8])|(8[\d])|(9[1,8,9]))\d{8}$/
    , info || (k => `'${k}' should be a mobile phone number`))
}
export function isLandline(info?: string) {
  return Rule(/\d{3}-\d{8}|\d{4}-\d{7}/
    , info || (k => `'${k}' should be a landline`))
}

export function isMailBox(info?: string) {
  return Rule(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    , info || (k => `'${k}' should be a mailbox`))
}

export function isIdCard(info?: string) {
  return Rule(/(^\d{8}(0\d|10|11|12)([0-2]\d|30|31)\d{3}$)|(^\d{6}(18|19|20)\d{2}(0\d|10|11|12)([0-2]\d|30|31)\d{3}(\d|X|x)$)/
    , info || (k => `'${k}' should be an identity card number`))
}

export function isCnName(info?: string) {
  return Rule(/^([\u4E00-\u9FA5·]{2,16})$/
    , info || (k => `'${k}' 需要是一个合理的中文名字`))
}

export function isEnName(info?: string) {
  return Rule(/(^[a-zA-Z]{1}[a-zA-Z\s]{0,20}[a-zA-Z]{1}$)/
    , info || (k => `'${k}' should be a valid en-name`))
}

// 2017-02-11
export function isDate(info?: string) {
  return Rule(/^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/
    , info || (k => `'${k}' should be a valid date`))
}

// 2017-02-11
export function isWechat(info?: string) {
  return Rule(/^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/
    , info || (k => `'${k}' should be a valid wechat`))
}

export function isHexColor(info?: string) {
  return Rule(/^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
    , info || (k => `'${k}' should be a valid hex-color`))
}

export function isPostalCode(info?: string) {
  return Rule(/^(0[1-7]|1[0-356]|2[0-7]|3[0-6]|4[0-7]|5[1-7]|6[1-7]|7[0-5]|8[013-6])\d{4}$/
    , info || (k => `'${k}' should be a valid postal code`))
}
