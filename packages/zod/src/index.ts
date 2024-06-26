import type { ZodSchema, ZodTypeDef, z } from 'zod'
import { addDecoToClass, setHandler, setStateKey } from 'phecda-core'

function ZodTo(cb: ((instance: any, addError:((msg: string) => void)) => any)) {
  return (proto: any, key?: PropertyKey) => {
    setStateKey(proto, key)
    setHandler(proto, key, {
      async pipe(instance: any, addError: (msg: string) => void) {
        const ret = cb(instance, addError)

        if (ret) {
          for (const key in instance) {
            if (key !== '_value')
              delete instance[key]
          }

          for (const key in ret)
            instance[key] = ret[key]
        }
      },
    })
  }
}
export function zodToClass<
    TOutput = any, TDef extends ZodTypeDef = ZodTypeDef, TInput = TOutput,
>(zod: ZodSchema<TOutput, TDef, TInput>): (new (data?: Partial<z.infer<ZodSchema<TOutput, TDef, TInput>>>) => z.infer<ZodSchema<TOutput, TDef, TInput>>) & {

  schema: ZodSchema<TOutput, TDef, TInput>
} {
  class Z {
    constructor(data: any) {
      for (const key in data)
        // @ts-expect-error trick
        this[key] = data[key]
    }

    static schema = zod
  }

  addDecoToClass(Z, undefined, ZodTo((ins, addError) => {
    const result = zod.safeParse(ins)
    if (!result.success)
      result.error.issues.forEach(({ message }) => addError(message))

    else return result.data
  }))

  return Z as any
}
