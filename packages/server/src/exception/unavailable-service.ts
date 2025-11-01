import { Exception } from './base'

export class ServiceUnavailableException extends Exception {
  constructor(message: string, metadata?: any) {
    super(message, metadata, 503, 'Service Unavailable')
  }
}
