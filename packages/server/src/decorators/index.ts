import { mergeState, setModalVar } from 'phecda-core'

export function Inject() { }

export function Header(name: string, value: string) {
  return (target: any, k: PropertyKey) => {
    setModalVar(target, k)
    mergeState(target, k, {
      header: { name, value },
    })
  }
}

export * from './param'
export * from './route'
