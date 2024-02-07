```ts
import axios from 'axios'
import { createReq } from 'phecda-client'
import { UserController } from './user.controller'
const instance = axios.create({
  baseURL: 'http://localhost:3699',
})
const useRequest = createReq(instance)
const { login } = useC(UserController)

async function request() {
  const { data } = await useRequest(login('username', 'version'))

  console.log(data)// user1
}
```