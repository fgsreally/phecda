import { Exception } from './base'
export class WorkerException extends Exception {
  constructor(message: string) {
    super(message, 0, 'Worker Error')
  }
}
