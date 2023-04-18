import { HttpException } from './base'

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(message, 404, 'Not Found')
  }
}
