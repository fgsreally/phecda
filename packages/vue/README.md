# phecda-vue
provide state management with phecda function to vue

## store
```ts
// in model
import { useR, useV } from 'phecda-vue'
export class Test {
  name = 'phecda'
  changeName() {
    this.name = 'vue'
  }
}
const state = useR(Test) // reactive
const { name, changeName } = useV(Test)// ref
```