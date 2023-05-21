import { HttpException } from './base'

export class ConflictException extends HttpException {
  constructor(message: string) {
    super(message, 409, 'Conflict')
  }
}
