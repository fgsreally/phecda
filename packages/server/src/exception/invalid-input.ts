import { Exception } from './base'

export class InvalidInputException extends Exception {
  constructor(message: string) {
    super(message, 502, 'Invalid Input')
  }
}
