import { PV, Tag, useV } from 'phecda-vue'
import { HomeModel } from './home'

@Tag('about')
export class AboutModel extends PV {
  change_home_name() {
    useV(HomeModel).changeName()
    console.log(this.tag)
  }

  emit_update() {
    this.emit('update', {
      from: this.tag,
      value: 'value from emitter',
      type: 'update',
    })
  }
}
