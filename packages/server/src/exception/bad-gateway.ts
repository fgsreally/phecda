import { Exception } from './base'

export class BadGatewayException extends Exception {
  constructor(message: string, metadata?: any) {
    super(message, metadata, 502, 'Bad Gatrway')
  }
}
