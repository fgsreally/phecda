import { Exception } from './base'

export class ValidateException extends Exception {
  constructor(message: string) {
    super(message, 400, 'Validate exception')
  }
}
