import { Exception } from './base'

export class PayloadLargeException extends Exception {
  constructor(message: string, metadata?: any) {
    super(message, metadata, 413, 'Payload Too Large')
  }
}
