# 验证与转换
 
`phecda-core`本身提供对类上属性的验证与转换
类似 `class-validator`/`class-transform`

## 简单验证

```ts
class A {
  @Rule(value => !!value, 'name can not be empty')
    name: string
}

const instance = plainToInstance(A, { name: '' })

// sync
const err = transformInstance(instance)

// async
const err = await transformInstanceAsync(instance)

// err =['name can not be empty']
```


## 复杂

```ts
class A {
  @To((value) => {
    if (value === '')
      throw new Error('name can not be empty')

    return 'any'
  })
    name: string
}

const instance = plainToInstance(A, { name: '1' })

transformInstance(instance)

await transformInstanceAsync(instance)

instance.name// 'any'
```