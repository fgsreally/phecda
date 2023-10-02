import { Tag } from 'phecda-module'
import { Child } from './child.module'
@Tag('parent')
export class Parent {
  constructor(public child: Child) {
    console.log('parent init')
  }

  destroyed() {
    console.log('parent destroy')
  }
}
