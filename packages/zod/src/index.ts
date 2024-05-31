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

// export function getZodPaths(model: ReturnType<typeof zodToClass>, path = ''): [string, string][] {
//   const { schema } = model
//   if (ins._def.typeName === 'ZodObject') {
//     console.log(schema.shape)

//     // 如果是对象类型，遍历其属性
//     return Object.entries(schema._def.shape).flatMap(([key, value]) => {
//       const newPath = path ? `${path}.${key}` : key
//       return getPathsAndTypes(value, newPath)
//     })
//   }
//   else if (schema._def.typeName === 'zodArray') {
//     // 如果是数组类型，递归处理数组元素的 schema
//     return getPathsAndTypes(schema._def.typeName, `${path}[]`)
//   }
//   else {
//     // 其他基本类型直接返回路径和类型
//     return [[path, schema._def.typeName]]
//   }
// }
