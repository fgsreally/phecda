import { HttpException } from './base'

export class PayloadLargeException extends HttpException {
  constructor(message: string) {
    super(message, 413, 'Payload Too Large')
  }
}
