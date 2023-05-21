import { HttpException } from './base'

export class ServiceUnavailableException extends HttpException {
  constructor(message: string) {
    super(message, 503, 'Service Unavailable')
  }
}
