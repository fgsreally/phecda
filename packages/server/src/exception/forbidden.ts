import { HttpException } from './base'

export class ForbiddenException extends HttpException {
  constructor(message: string) {
    super(message, 403, 'Forbidden resource')
  }
}
