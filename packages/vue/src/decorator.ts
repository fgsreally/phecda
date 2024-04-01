import { set } from 'phecda-web'
export function Shallow(module: any) {
  set(module.prototype, 'shallow', true)
}
