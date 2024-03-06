export const MERGE_SYMBOL = '__PS_MERGE__'
export const UNMOUNT_SYMBOL = '__PS_UNMOUNT__'
export const MODULE_SYMBOL = '__PS_MODULE__'
export const META_SYMBOL = '__PS_META__'
export const APP_SYMBOL = '__PS__'
export const IS_DEV = process.env.NODE_ENV === 'development'
export const IS_STRICT = !!process.env.PS_STRICT
export const IS_LOG_BAN = !!process.env.PS_LOG_BAN
export const ERROR_SYMBOL = '__PS_ERROR__'
export const PS_FILE_RE = /\.(controller|service|module|extension|ext|guard|interceptor|addon|filter|pipe|edge)\.ts$/i

// ???
export const PS_IMPORT_RE = /\.(controller|extension|ext|guard|interceptor|addon|filter|pipe|edge)\.ts$/i
