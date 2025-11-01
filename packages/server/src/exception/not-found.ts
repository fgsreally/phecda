import { Exception } from './base'

export class NotFoundException extends Exception {
  constructor(message: string, metadata?: any) {
    super(message, metadata, 404, 'Not Found')
  }
}
