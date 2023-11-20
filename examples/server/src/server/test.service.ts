import { Dev, Init } from 'phecda-server'
import { log } from './utils'

class c {
  run() {
    log('cc')

    return 'c'
  }
}
export abstract class BaseService<T extends new (...args: any) => any> extends Dev {
  abstract fgs: InstanceType<T>

  @Init
  init() {
    console.log('init')
    this.onUnmount(() => {
      console.log('unmount')
    })
  }

  find() {
    return 'find!'
  }
}

export class A extends BaseService<typeof c> {
  fgs = new c()
}
