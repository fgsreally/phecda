import { Exception } from './base'

export class FrameworkException extends Exception {
  constructor(message: string, metadata?: any) {
    super(`[phecda-server] ${message}`, metadata, 500, 'Framework Error')
  }
}
