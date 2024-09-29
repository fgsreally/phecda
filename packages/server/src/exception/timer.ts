import { Exception } from './base'
export class TimerException extends Exception {
  constructor(message: string) {
    super(message, 0, 'Timer Error')
  }
}
