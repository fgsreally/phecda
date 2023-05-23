import { HttpException } from './base'

export class BadGatewayException extends HttpException {
  constructor(message: string) {
    super(message, 502, 'Bad Gatrway')
  }
}
