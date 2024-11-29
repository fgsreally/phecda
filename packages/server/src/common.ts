export const ERROR_SYMBOL = '__PS_ERROR__'// only use in paralle request

export const IS_DEV = process.env.NODE_ENV === 'development'
export const IS_ONLY_GENERATE = !!process.env.PS_GENERATE// work for ci; only generate code
export const IS_STRICT = !!process.env.PS_STRICT// throw error if depends on an aop module which is not imported
export const IS_PURE = !!process.env.PS_PURE// pure mode, will skip detectAopDep

export const LOG_LEVEL = Number(process.env.PS_LOG_LEVEL || 0)// internal logger

export enum PS_EXIT_CODE {
  RELAUNCH = 2,
  CODE = 4,
}
