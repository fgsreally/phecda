import { set } from 'phecda-web'
export function Shallow(model: any) {
  set(model.prototype, 'shallow', true)
}
