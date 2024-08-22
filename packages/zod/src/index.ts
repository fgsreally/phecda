import type { ZodSchema, ZodTypeDef, z } from 'zod'
import { addDecoToClass, getMeta, setMeta } from 'phecda-core'

function ZodTo(zod: ZodSchema) {
  return (proto: any) => {
    setMeta(proto, undefined, undefined, {
      zod,
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
      Object.assign(this, data)
    }

    static schema = zod
  }

  addDecoToClass(Z, undefined, ZodTo(zod))

  return Z as any
}

export function parse<Construct extends ReturnType<typeof zodToClass>>(C: Construct, data: ConstructorParameters<Construct>[0]) {
  const meta = getMeta(C)
  const zod = meta.find(item => !!item.zod).zod as ZodSchema
  return zod.safeParse(data)
}
