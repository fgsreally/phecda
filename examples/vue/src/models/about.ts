import { P, Tag } from 'phecda-vue'
import { HomeModel } from './home'

@Tag('about')
// @Shallow
export class AboutModel extends P {
  constructor(protected home: HomeModel) {
    super()
  }

  data = {
    name: 'fgs',
  }

  change_home_name() {
    this.data.name = 'fgp'
    this.home.changeName()
  }

  emit_update() {
    this.emit('add', null)
    this.emit('update', {
      from: this.tag as string,
      value: 'value from emitter',
      type: 'update',
    })
  }
}
