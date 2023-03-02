import { PhecdaWeb, Tag, useV } from 'phecda-core'
import { HomeModel } from './home'

@Tag('about')
export class AboutModel extends PhecdaWeb {
  change_home_name() {
    useV(HomeModel).changeName()
  }

  emit_update() {
    this.emit('update', {
      from: this._symbol,
      value: 'value from emitter',
      type: 'update',
    })
  }
}
