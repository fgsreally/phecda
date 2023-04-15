import { HttpException } from './base'

export class UndefinedException extends HttpException {
  constructor(message: string) {
    super(message, 500, 'undefined error')
  }
}
