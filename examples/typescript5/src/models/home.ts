import { Clear, Global, Init, Storage, Tag, Watcher, useEvent } from 'phecda-vue'

@Tag('base')

export class Base {
  name = 'base'
  @Init
  run() {
    console.log('run')
  }
}
@Global
@Tag('aa')
@Storage('fgs')
// @Tag('home')
export class HomeModel<T> extends Base {
  // name = 'home'
  key: T
  readonly obj = {
    id: 1,
    isChange: false,
  }

  get fullName() {
    return `--${this.name}--`
  }

  changeName() {
    console.log(this)

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
