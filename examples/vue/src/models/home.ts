import { Clear, Global, Init, Storage, Tag, Watcher, useEvent } from 'phecda-vue'
import { h, markRaw, render } from 'vue'
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
    // console.log(this)
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
    const el = document.createElement('div')
    const vnode = h(this.component)
    document.body.appendChild((render(vnode, el), el))

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
