import { Exception } from './base'

export class NotFoundException extends Exception {
  constructor(message: string) {
    super(message, 404, 'Not Found')
  }
}
