import { Exception } from './base'

export class UnsupportedMediaTypeException extends Exception {
  constructor(message: string) {
    super(message, 415, 'Unsupported Media Type')
  }
}
