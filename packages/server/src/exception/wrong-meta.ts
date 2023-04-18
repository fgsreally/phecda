import { HttpException } from './base'

export class WrongMetaException extends HttpException {
  constructor(message: string) {
    super(message, 500, 'Meta is not correct')
  }
}
