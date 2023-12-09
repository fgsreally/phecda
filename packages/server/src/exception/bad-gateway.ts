import { Exception } from './base'

export class BadGatewayException extends Exception {
  constructor(message: string) {
    super(message, 502, 'Bad Gatrway')
  }
}
