import { Clear, Global, Init, Storage, Tag, WatchEffect, Watcher, markRaw, useEvent } from 'phecda-vue'
@Tag('base')

export class Base {
  name = 'base'
  @Init
  async run() {
    // console.log('init')
  }
}
@Global
@Storage()
@Tag('aa')

// @Tag('home')
export class HomeModel<T> extends Base {
  // name = 'home'

  constructor() {
    super()
  }

  component = markRaw({
    name: 'fgs',
  })

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
    // eslint-disable-next-line no-alert
    alert('update')
  }

  @Clear
  run: any

  @WatchEffect()
  effect() {
    // eslint-disable-next-line no-console
    console.log(this.name)
  }
}
