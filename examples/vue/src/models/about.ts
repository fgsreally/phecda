import { Tag, WebBase } from 'phecda-vue'
import { UserModel } from './user'

@Tag('about')
// @Shallow
export class AboutModel extends WebBase {
  constructor(protected user: UserModel) {
    super()
  }

  createdAt = {
    hour: new Date().getHours(),

    minute: new Date().getMinutes(),
    second: new Date().getSeconds(),
  }

  changeUserName(name: string) {
    this.createdAt.second = new Date().getSeconds() // it won't update view
    this.user.changeName(name)
  }

  emit_update() {
    this.emit('add', null)
    this.emit('update', 'jerry')
  }
}
