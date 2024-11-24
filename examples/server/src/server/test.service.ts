/* eslint-disable no-console */
import { log } from './utils'
@Injectable()
@Tag('test')
export class TestService {
  login(user: any) {
    console.log(`user ${user.name} login ...`)
    console.log(user)
    log('test')
  }

  @Watcher('test')
  watch(data: number) {
    console.log(`emit "test" event with ${data}`)
  }

  test() {
    console.log(3)
    log('test')
  }
}
