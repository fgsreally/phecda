import { getHandler, getModelState, validate } from 'phecda-core'

export function getElementPlusRules<M, O extends object>(Model: M, options: O = {} as any): any {
  const stateVars = getModelState(Model as any)
  const ret: { [key: string]: { validator: Function; [key: string]: any }[] } = {}
  for (const item of stateVars) {
    const handlers = getHandler(Model as any, item)
    if (handlers) {
      for (const handler of handlers) {
        const { rule, meta, info } = handler
        // const ret = await handler.rule?.(data)
        if (rule) {
          if (!ret[item])
            ret[item] = []
          ret[item].push({
            validator: async (_: any, value: any, callback: any) => {
              if (!await validate(rule, value))
                callback(new Error(info || ''))

              else
                callback()
            },
            ...options,

            ...(meta || {}),
          })
        }
      }
    }
  }
  return ret
}

export const GetDevUIRules = getElementPlusRules

export function getNaiveUIRules<M, O extends object>(Model: M, options: O = {} as any): any {
  const stateVars = getModelState(Model as any)
  const ret: { [key: string]: { validator: Function; [key: string]: any }[] } = {}
  for (const item of stateVars) {
    const handlers = getHandler(Model as any, item)
    if (handlers) {
      for (const handler of handlers) {
        const { rule, meta, info } = handler
        // const ret = await handler.rule?.(data)
        if (rule) {
          if (!ret[item])
            ret[item] = []
          ret[item].push({
            validator: async (_: any, value: any) => {
              if (!(await validate(rule, value)))
                return Promise.reject(info)

              else
                return Promise.resolve()
            },
            ...options,

            ...(meta || {}),
          })
        }
      }
    }
  }
  return ret
}

export const getAntDRules = getNaiveUIRules

export function getNutUIRules<M, O extends object>(Model: M, options: O = {} as any): any {
  const stateVars = getModelState(Model as any)
  const ret: { [key: string]: { validator: Function; [key: string]: any }[] } = {}
  for (const item of stateVars) {
    const handlers = getHandler(Model as any, item)
    if (handlers) {
      for (const handler of handlers) {
        const { rule, meta, info } = handler
        // const ret = await handler.rule?.(data)
        if (rule) {
          if (!ret[item])
            ret[item] = []
          ret[item].push({
            validator: async (_: any, value: any) => {
              if (!(await validate(rule, value)))
                return false

              else
                return true
            },
            message: info,
            ...options,

            ...(meta || {}),
          })
        }
      }
    }
  }
  return ret
}

export const getVantRules = getNutUIRules
