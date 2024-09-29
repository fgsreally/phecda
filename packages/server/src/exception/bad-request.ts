import { Exception } from './base'

export class BadRequestException extends Exception {
  constructor(message: string) {
    super(message, 400, 'Bad Request')
  }
}
