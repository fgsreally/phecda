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
@Storage
// @Tag('home')
export class HomeModel extends Base {
  // name = 'home'

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
