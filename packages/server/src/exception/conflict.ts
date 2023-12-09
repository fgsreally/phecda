import { Exception } from './base'

export class ConflictException extends Exception {
  constructor(message: string) {
    super(message, 409, 'Conflict')
  }
}
