import { Exception } from './base'

export class ServiceUnavailableException extends Exception {
  constructor(message: string) {
    super(message, 503, 'Service Unavailable')
  }
}
