import { Exception } from './base'

export class InvalidInputException extends Exception {
  constructor(message: string, metadata?: any) {
    super(message, metadata, 502, 'Invalid Input')
  }
}
