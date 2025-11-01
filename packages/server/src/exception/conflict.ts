import { Exception } from './base'

export class ConflictException extends Exception {
  constructor(message: string, metadata?: any) {
    super(message, metadata, 409, 'Conflict')
  }
}
