import { HttpException } from './base'

export class TimeoutException extends HttpException {
  constructor(message: string) {
    super(message, 408, 'Request Timeout',
    )
  }
}
