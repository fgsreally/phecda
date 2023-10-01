import { Tag } from 'phecda-module'
@Tag('child')
export class Child {
  name = 'child1'
  constructor(public a: typeof b) {
    console.log('Child')
  }

  destroyed() {
    console.log('Child destroy')
  }
}

const b = {
  name: 'a',
}
