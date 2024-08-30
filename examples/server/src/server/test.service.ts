/* eslint-disable no-console */
@Injectable()
@Tag('TestService')
export class TestService {
  login(user: User) {
    console.log(`user ${user.name} login ...`)
    console.log(user)
  }

  @Watcher('test')
  watch(data: number) {
    console.log(`emit "test" event with ${data}`)
  }
}
