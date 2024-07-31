import { describe, expect, it } from 'vitest'
import z from 'zod'
import { transformInstance } from 'phecda-core'
import { zodToClass } from '../src'

describe('zod in phecda', () => {
  it('basic validate', () => {
    const UserSchema = z.object({
      username: z.string().min(3).max(20), // username 必须为长度在 3 到 20 之间的字符串
      email: z.string().email(),
      isAdmin: z.boolean(), // isAdmin 必须为布尔值

    })

    const UserModel = zodToClass(UserSchema)
    const instance = new UserModel()
    instance.username = 'phecda'
    instance.email = 'phecda@a.com';
    // exclude
    (instance as any).xx = 'xx'
    expect(transformInstance(instance)).toMatchSnapshot()

    instance.isAdmin = true

    expect(transformInstance(instance).length).toBe(0)
    expect('xx' in instance).toBe(false)

    expect(UserModel.schema).toBeDefined()
    expect(instance).toMatchSnapshot()
  })
})
