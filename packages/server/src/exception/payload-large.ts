import { Exception } from './base'

export class PayloadLargeException extends Exception {
  constructor(message: string) {
    super(message, 413, 'Payload Too Large')
  }
}
