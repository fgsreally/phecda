import { describe, expect, it } from 'vitest'
import z from 'zod'
import { validate } from 'phecda-core'
import { zodToClass } from '../src'
describe('phecda-zod', () => {
  it('parse', async () => {
    const UserSchema = z.object({
      username: z.string().min(3).max(20), // username 必须为长度在 3 到 20 之间的字符串
      email: z.string().email(),
      isAdmin: z.boolean(), // isAdmin 必须为布尔值

    })

    const UserModel = zodToClass(UserSchema)

    const err1 = await validate(UserModel, { username: 'phecda', email: 'fakeEmail' })
    expect(err1.length).toBe(1)
    expect(err1[0].errors.length).toBe(2)

    const err2 = await validate(UserModel, { username: 'phecda', email: 'phecda@a.com', isAdmin: true })
    expect(err2.length).toBe(0)
  })
})
