import { Tag } from 'phecda-three'
@Tag('child')
export class Child {
  name = 'child'
  constructor() {
    console.log('Child')
  }

  destroyed() {
    console.log('Child destroy')
  }
}

if (import.meta.hot)
  import.meta.hot.accept(__PHECDA_THREE__)
