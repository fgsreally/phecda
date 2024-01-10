/* eslint-disable no-console */
import { Tag } from 'phecda-module'
@Tag('child')
export class Child {
  name = 'child1'
  constructor() {
    console.log('Child')
  }

  destroyed() {
    console.log('Child destroy')
  }
}
