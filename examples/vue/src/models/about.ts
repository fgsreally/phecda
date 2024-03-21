import { PV, Shallow, Tag, useV } from 'phecda-vue'
import { HomeModel } from './home'

@Tag('about')
@Shallow
export class AboutModel extends PV {
  data = {
    name: 'fgs',
  }

  change_home_name() {
    this.data = { name: 'fgp' }
    useV(HomeModel).changeName()
    // console.log(this.tag)
  }

  emit_update() {
    this.emit('add', null)
    this.emit('update', {
      from: this.tag,
      value: 'value from emitter',
      type: 'update',
    })
  }
}
