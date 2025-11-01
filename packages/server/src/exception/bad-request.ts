import { Exception } from './base'

export class BadRequestException extends Exception {
  constructor(message: string, metadata?: any) {
    super(message, metadata, 400, 'Bad Request')
  }
}
