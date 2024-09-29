import { Exception } from './base'

export class TimeoutException extends Exception {
  constructor(message: string) {
    super(message, 408, 'Request Timeout',
    )
  }
}
