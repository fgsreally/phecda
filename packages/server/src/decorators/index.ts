import { mergeState, setModalVar } from 'phecda-core'

export function Inject(_target: any) { }

export function Header(name: string, value: string) {
  return (target: any, k: PropertyKey) => {
    setModalVar(target, k)
    mergeState(target, k, {
      header: { name, value },
    })
  }
}

export function Meta(key: string, value: any) {
  return (target: any, k: PropertyKey) => {
    setModalVar(target, k)
    mergeState(target, k, {
      meta: { [key]: value },
    })
  }
}

export * from './param'
export * from './route'

export * from './micro'
