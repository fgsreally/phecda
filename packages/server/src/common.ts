// export const MERGE_SYMBOL = '__PS_MERGE__'// is parallel request in http
export const UNMOUNT_SYMBOL = '__PS_UNMOUNT__'// property that include unmount callbacks
// export const MODULE_SYMBOL = '__PS_MODULE__'// req[MODULE_SYMBOL]=modulemap
// export const META_SYMBOL = '__PS_META__'// req[META_SYMBOL]=meta
// export const PS_SYMBOL = '__PS__'// (app/router)[PS_SYMBOL]=Factory(...)
export const ERROR_SYMBOL = '__PS_ERROR__'// only use in paralle request

export const IS_HMR = process.env.NODE_ENV === 'development'
export const IS_ONLY_GENERATE = !!process.env.PS_GENERATE// work for ci; only generate code
export const IS_STRICT = !!process.env.PS_STRICT// throw error if depends on an aop module which is not imported
export const LOG_LEVEL = Number(process.env.PS_LOG_LEVEL || 0)// internal logger

export const PS_FILE_RE = /[^.](?:\.controller|rpc|service|module|extension|ext|guard|interceptor|plugin|filter|pipe|edge)\.ts$/i

export enum PS_EXIT_CODE {
  RELAUNCH = 2,
  CODE = 4,
}
