import { Exception } from './base'

export class FrameworkException extends Exception {
  constructor(message: string) {
    super(`[phecda-server] ${message}`, 500, 'Framework Error')
  }
}
