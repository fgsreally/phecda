import { Exception } from './base'

export class ForbiddenException extends Exception {
  constructor(message: string) {
    super(message, 403, 'Forbidden resource')
  }
}
