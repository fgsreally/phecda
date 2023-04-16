import { HttpException } from './base'

export class ValidateException extends HttpException {
  constructor(message: string) {
    super(message, 400, 'Validate exception')
  }
}
