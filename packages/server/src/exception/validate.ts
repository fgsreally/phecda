import { Exception } from './base'

export class ValidateException extends Exception {
  constructor(message: string, metadata?: any) {
    super(message, metadata, 400, 'Validate exception')
  }
}
