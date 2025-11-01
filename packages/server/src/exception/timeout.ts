import { Exception } from './base'

export class TimeoutException extends Exception {
  constructor(message: string, metadata?: any) {
    super(message, metadata, 408, 'Request Timeout',
    )
  }
}
