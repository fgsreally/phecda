import { Exception } from './base'

export class UnauthorizedException extends Exception {
  constructor(message: string) {
    super(message, 401, 'Unauthorized')
  }
}
