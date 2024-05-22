import { Dev, Empty, Init } from 'phecda-server'
import { log } from './utils'

class C {
  run() {
    log('cc2')

    return 'c'
  }
}
abstract class BaseService<T extends new (...args: any) => any> extends Dev {
  abstract abInstance: InstanceType<T>

  @Init
  init() {
    this.abInstance.run()
    // this.onUnmount(() => {
    //   console.log('unmount')
    // })
  }

  find() {
    return 'find!!'
  }
}

@Empty
export class TestService extends BaseService<typeof C> {
  abInstance = new C()
}
