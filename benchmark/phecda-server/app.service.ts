import { Injectable } from 'phecda-server'

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!'
  }
}
