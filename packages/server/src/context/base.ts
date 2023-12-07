import { Histroy } from '../history'

export abstract class BaseContext<Data = any> {
  method: string
  params: string[]
  history = new Histroy()

  constructor(public key: string, public data: Data) {
  }
}
