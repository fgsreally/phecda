/* eslint-disable no-console */
@Injectable()
export class TestService {
  login(user: User) {
    // login logic
    console.log(`user ${user.name} login ...`)
  }

  @Watcher('test')
  watch(data: number) {
    console.log(`emit "test" event with ${data}`)
  }
}
