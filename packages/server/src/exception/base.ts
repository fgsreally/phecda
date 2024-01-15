import { ERROR_SYMBOL } from '../common'

export class Exception extends Error {
  constructor(public message: string, public status: number, public description = 'Http exception') {
    super(message)
  }

  get data() {
    return { message: this.message, description: this.description, status: this.status, [ERROR_SYMBOL]: true }
  }
}
