import { Clear, Global, Init, Storage, Tag, Watcher, useEvent } from 'phecda-vue'
import { markRaw } from 'vue'
import HelloWorld from '../components/HelloWorld.vue'
@Tag('base')

export class Base {
  name = 'base'
  @Init
  async run() {
    // console.log('init')
  }
}
@Global
@Tag('aa')
@Storage('fgs')
// @Tag('home')
export class HomeModel<T> extends Base {
  // name = 'home'

  constructor() {
    super()
  }

  component = markRaw(HelloWorld)

  key: T
  readonly obj = {
    id: 1,
    isChange: false,
  }

  get fullName() {
    return `--${this.name}--`
  }

  changeName() {
    this.name = 'fgs'
  }

  @Init
  on_update() {
    useEvent('update', (e) => {
      this.name = `${e.value} from ${e.from}`
    })
  }

  @Watcher('update', { once: true })

  on_Watch() {
    alert('update')
  }

  @Clear
  run: any
}
