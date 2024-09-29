import { Base, Tag,  } from 'phecda-react'
import { UserModel } from './user'

@Tag('about')
export class AboutModel extends Base {
  constructor(protected user: UserModel) {
    super()
    // eslint-disable-next-line react-hooks/rules-of-hooks

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
