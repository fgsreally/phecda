import { ERROR_SYMBOL } from '../common'

export class Exception extends Error {
  constructor(public message: string, public metadata?: any, public status = 0, public description = 'Exception',) {
    super(message)
  }

  get data() {
    return { message: this.message, description: this.description, status: this.status, [ERROR_SYMBOL]: true,  }
  }
}
