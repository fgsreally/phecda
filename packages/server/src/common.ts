export const MERGE_SYMBOL = '__PS_MERGE__'// is parallel request in http
export const UNMOUNT_SYMBOL = '__PS_UNMOUNT__'// property that include unmount callbacks
export const MODULE_SYMBOL = '__PS_MODULE__'// req[MODULE_SYMBOL]=modulemap
export const META_SYMBOL = '__PS_META__'// req[META_SYMBOL]=meta
export const PS_SYMBOL = '__PS__'// (app/router)[PS_SYMBOL]=Factory(...)
export const ERROR_SYMBOL = '__PS_ERROR__'// only use in paralle request

export const IS_DEV = process.env.NODE_ENV === 'development'
export const IS_ONLY_CODE = !!process.env.PS_CODE
export const IS_STRICT = !!process.env.PS_STRICT
export const IS_LOG_BAN = !!process.env.PS_LOG_BAN || IS_ONLY_CODE

export const PS_FILE_RE = /[^.](?:\.controller|service|module|extension|ext|guard|interceptor|plugin|filter|pipe|edge)\.ts$/i

export enum PS_EXIT_CODE {
  RELAUNCH = 2,
  CODE = 4,
}
