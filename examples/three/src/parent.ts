import { Tag } from 'phecda-three'
import { Child } from './child'
@Tag('parent')
export class Parent {
  constructor(public child: Child) {
    console.log('parent init')
  }

  destroyed() {
    console.log('parent destroy')
  }
}

if (import.meta.hot)
  import.meta.hot.accept(__PHECDA_THREE__)
