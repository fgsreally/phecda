import { Init, PhecdaWeb, Storage, Tag, Watcher } from 'phecda-core'

@Storage
@Tag('home')
export class HomeModel extends PhecdaWeb {
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
    this.on('update', (e) => {
      this.name = `${e.value} from ${e.from}`
    })
  }

  @Watcher('update')
  on_Watch() {
    alert('update')
  }
}
