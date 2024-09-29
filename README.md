# Phecda
More possibilities for responsiveness 

## core
### validate and transform data like `class-validator`/`class-transform`

```ts
class Parent {
  @Rule('phecda', 'name should be phecda')
  @Pipe(to((name: string) => `${name}1`)
    .to(name => `${name}1`))
    name: string

  @Get
  get fullname() {
    return `${this.name}-core`
  }

  changeName() {
    this.name = 'phecda-changed'
  }
}

const { data, err } = await plainToClass(Parent, { name: 'phecda' })

/**
 * data:{name:'phecda11'}
 * err:null
 */
```
## phecda-vue
> work for `vue`

### as a store like `pinia`
```ts
export class HomeModel {
  name = 'home'

  get fullName() {
    return `--${this.name}--`
  }

  changeName() {
    this.name = 'fgs'
  }

}
```

```vue
<script setup lang="ts">
import { useV } from 'phecda-vue'
const { name, changeName, fullName } = useV(HomeModel)
</script>

<template>
  {{ name }}
  {{ fullName }}
  <button @click="changeName">
    changeName
  </button>
</template>
```

### use in form/table
[example](./examples/form)


