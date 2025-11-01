import { Exception } from './base'
export class TimerException extends Exception {
  constructor(message: string, metadata?: any) {
    super(message, metadata, 0, 'Timer Error')
  }
}
