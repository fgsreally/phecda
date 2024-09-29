/* eslint-disable no-console */
import { Clear, Global, Init, Storage, Tag, WatchEffect, Watcher, WebBase, markRaw } from 'phecda-vue'
@Tag('BaseUser')

export class BaseUser extends WebBase {
  name = 'BaseUser'
  @Init
  async __init__() {
    console.log('init BaseUser')
  }
}
@Global
@Storage()
@Tag('User')

export class UserModel<Data = any> extends BaseUser {
  constructor() {
    super()
  }

  createdAt = markRaw({
    hour: new Date().getHours(),
    minute: new Date().getMinutes(),
    second: new Date().getSeconds(),
  })

  data: Data
  readonly obj = {
    id: 1,
    isChange: false,
  }

  get fullName() {
    return `--${this.name}--`
  }

  changeName(name: string) {
    this.createdAt.second = new Date().getSeconds() // it won't update view
    this.name = name
  }

  @Init
  private _init_user() {
    this.on('update', this.changeName.bind(this))
  }

  @Watcher('update', { once: true })

  private _watch_update() {
    console.log('emit update event')
  }

  @Clear
   __init__: any

  @WatchEffect()
  private _effect() {
    console.log(`watch effect:${this.name}`)
  }
}
