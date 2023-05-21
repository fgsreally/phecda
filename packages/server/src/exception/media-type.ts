import { HttpException } from './base'

export class UnsupportedMediaTypeException extends HttpException {
  constructor(message: string) {
    super(message, 415, 'Unsupported Media Type')
  }
}
