import { Exception } from './base'

export class UnauthorizedException extends Exception {
  constructor(message: string, metadata?: any) {
    super(message, metadata, 401, 'Unauthorized')
  }
}
