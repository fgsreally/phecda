import { Exception } from './base'

export class UndefinedException extends Exception {
  constructor(message: string) {
    super(message, 500, 'Undefined error')
  }
}
