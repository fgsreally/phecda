import { describe, expect, it } from 'vitest'
import { Construct, Enum, Max, Min, Nested, Optional, Required, Rule, validate } from '../src'

const testValidate = async (model: Construct, data: any, errLength: number) => {
  const err = await validate(model, data, true)
  expect(err.length).toBe(errLength)
}

describe('validate', () => {
  it('reflect-metadata', async () => {
    class Entity1 {
      @Optional
            name?: string

      @Optional
            age?: number
    }
    await testValidate(Entity1, {
      name: 1,
    }, 1)

    await testValidate(Entity1, {
      age: '10',
    }, 1)

    await testValidate(Entity1, {
      name: 'Phecda',
      age: 18,
    }, 0)
    class Entity2 {
      @Required
            strs: string[]
    }

    await testValidate(Entity2, {
      strs: '1',
    }, 1)

    await testValidate(Entity2, {
      strs: ['1'],
    }, 0)
  })
  it('Rule', async () => {
    @Rule(({ value }) => {
      if (typeof value !== 'object')
        return 'data must be an object'
    })
    class Entity {
      @Rule(({ value }) => {
        if (typeof value !== 'object')
          return 'data must be an object'
      })
            data: any
    }

    await testValidate(Entity, undefined, 2)
    await testValidate(Entity, {
      data: '1',
    }, 1)
    await testValidate(Entity, {
      data: {},
    }, 0)
  })

  it('Required/Optional', async () => {
    class Entity {
      @Required
            name: string

      @Optional
            age?: number
    }

    await testValidate(Entity, {
      age: 10,
    }, 1)
    await testValidate(Entity, {
      name: 'Phecda',
    }, 0)

    await testValidate(Entity, {
      name: 'Phecda',
      age: 10,
    }, 0)
  })

  it('Min/Max', async () => {
    class Entity {
      @Min(3)
      @Max(6)
      @Optional
            name: string

      @Min(18)
      @Max(40)
      @Optional
            age: number
    }

    await testValidate(Entity, {
      name: 'P',
    }, 1)

    await testValidate(Entity, {
      age: 10,
    }, 1)

    await testValidate(Entity, {
      name: 'Phecda1',
    }, 1)

    await testValidate(Entity, {
      age: 41,
    }, 1)

    await testValidate(Entity, {
      name: 'Phecda',
      age: 18,
    }, 0)
  })

  it('Enum', async () => {
    enum TEST_DATA {
      A = 'A',
      B = 'B',
    }
    class Entity {
      @Enum(TEST_DATA)
            name: TEST_DATA
    }
    await testValidate(Entity, {
      name: 'C',
    }, 1)
    await testValidate(Entity, {
      name: 'A',
    }, 0)
    await testValidate(Entity, {
      name: 'B',
    }, 0)
  })

  it('Nested', async () => {
    class SubEntity {
      @Required
            name: string
    }
    class Entity1 {
      @Nested(SubEntity)
            data: SubEntity
    }

    await testValidate(Entity1, {
      data: {
      },
    }, 1)

    await testValidate(Entity1, {
      data: {
        name: 'Phecda',
      },
    }, 0)

    class Entity2 {
      @Nested(SubEntity)
            data: SubEntity[]
    }
    await testValidate(Entity2, {
      data: {
      },
    }, 1)

    await testValidate(Entity2, {
      data: [
        {
          name: 1,
        },
      ],
    }, 1)

    await testValidate(Entity2, {
      data: [
        {
          name: 1,
        },
        {
          name: 2,
        },
      ],
    }, 1)
    await testValidate(Entity2, {
      data: [
        {
          name: 'Phecda',
        },
      ],
    }, 0)
  })

  it('collectErrors', async () => {
    class Entity {
      @Required
            name: string

      @Required
            age: number
    }
    await testValidate(Entity, {
    }, 2)
  })
})
