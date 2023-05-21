import { HttpException } from './base'

export class FrameworkException extends HttpException {
  constructor(message: string) {
    super(`[phecda-server] ${message}`, 500, 'Framework Error')
  }
}
