import { HttpException } from './base'

export class BadRequestException extends HttpException {
  constructor(message: string) {
    super(message, 400, 'Bad Request')
  }
}
