import { P, Tag, useV } from 'phecda-core'
import { HomeModel } from './home'

@Tag('about')
export class AboutModel extends P {
  change_home_name() {
    useV(HomeModel).changeName()
  }

  emit_update() {
    this.emit('update', {
      from: this.tag as any,
      value: 'value from emitter',
      type: 'update',
    })
  }
}
