import { Dev, Empty, Init } from 'phecda-server'
import { log } from './utils'

class c {
  run() {
    log('cc2')

    return 'c'
  }
}
abstract class BaseService<T extends new (...args: any) => any> extends Dev {
  abstract fgs: InstanceType<T>

  @Init
  init() {
    console.log('initxx')
    this.fgs.run()
    this.onUnmount(() => {
      console.log('unmount')
    })
  }

  find() {
    return 'find!'
  }
}

@Empty
export class A extends BaseService<typeof c> {
  fgs = new c()
}
