import { Exception } from './base'

export class ForbiddenException extends Exception {
  constructor(message: string, metadata?: any) {
    super(message, metadata, 403, 'Forbidden resource')
  }
}
