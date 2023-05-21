import { HttpException } from './base'

export class UnauthorizedException extends HttpException {
  constructor(message: string) {
    super(message, 401, 'Unauthorized')
  }
}
