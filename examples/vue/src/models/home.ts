import { Clear, Init, Storage, Tag, Watcher, Window, useEvent } from 'phecda-vue'

@Tag('base')

export class Base {
  name = 'base'
  @Init
  run() {
    console.log('run')
  }
}
@Window
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

  protect changeName() {
    this.name = 'fgs'
  }

  @Init
  on_update() {
    useEvent('update', (e) => {
      this.name = `${e.value} from ${e.from}`
    })
  }

  @Watcher('update')
  @Watcher('new')

  on_Watch() {
    alert('update')
  }

  @Clear
  run: any
}
