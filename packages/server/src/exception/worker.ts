import { Exception } from './base'
export class WorkerException extends Exception {
  constructor(message: string, metadata?: any) {
    super(message, metadata, 0, 'Worker Error')
  }
}
