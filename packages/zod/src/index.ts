import type { ZodSchema, ZodTypeDef, z } from 'zod'
import { Rule, addDecoToClass } from 'phecda-core'

export function zodToClass<
  TOutput = any, TDef extends ZodTypeDef = ZodTypeDef, TInput = TOutput,
>(zod: ZodSchema<TOutput, TDef, TInput>): (new (data?: Partial<z.infer<ZodSchema<TOutput, TDef, TInput>>>) => z.infer<ZodSchema<TOutput, TDef, TInput>>) & {

  schema: ZodSchema<TOutput, TDef, TInput>
} {
  class Z {
  }

  addDecoToClass(Z, undefined, Rule(({ value }) => {
    const { success, error } = zod.safeParse(value)
    if (!success)
      return error
  }))

  return Z as any
}
