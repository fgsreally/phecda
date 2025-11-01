import { Exception } from './base'

export class UndefinedException extends Exception {
  constructor(message: string, metadata?: any) {
    super(message, metadata, 500, 'Undefined error')
  }
}
