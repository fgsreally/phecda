import { Init, Storage, Tag, Watcher, useOn } from 'phecda-core'

@Storage
@Tag('home')

export class HomeModel {
  name = 'home'

  obj = {
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
    useOn('update', (e) => {
      this.name = `${e.value} from ${e.from}`
    })
  }

  @Watcher('update')
  @Watcher('test')
  on_Watch() {
    alert('update')
  }
}
