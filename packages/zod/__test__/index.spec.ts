import { describe, expect, it } from 'vitest'
import z from 'zod'
import { parse, zodToClass } from '../src'

describe('phecda-zod', () => {
  it('parse', () => {
    const UserSchema = z.object({
      username: z.string().min(3).max(20), // username 必须为长度在 3 到 20 之间的字符串
      email: z.string().email(),
      isAdmin: z.boolean(), // isAdmin 必须为布尔值

    })

    const UserModel = zodToClass(UserSchema)

    const ret1 = parse(UserModel, { username: 'phecda', email: 'phecda@a.com' })
    expect(ret1.success).toBeFalsy()
    // expect().toMatchSnapshot()
    const ret2 = parse(UserModel, { username: 'phecda', email: 'phecda@a.com', xx: 'xx', isAdmin: true } as any)

    expect(ret2.success).toBeTruthy()
    expect(ret2.data).toMatchSnapshot()
    expect('xx' in ret2.data).toBe(false)

    // expect(UserModel.schema).toBeDefined()
    // expect(instance).toMatchSnapshot()
  })
})
