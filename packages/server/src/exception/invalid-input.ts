import { HttpException } from './base'

export class InvalidInputException extends HttpException {
  constructor(message: string) {
    super(message, 502, 'Invalid Input')
  }
}
