import { Exception } from './base'

export class UnsupportedMediaTypeException extends Exception {
  constructor(message: string, metadata?: any) {
    super(message, metadata, 415, 'Unsupported Media Type')
  }
}
