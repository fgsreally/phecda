import { mergeState, setModalVar } from 'phecda-core'
/**
 *
 * @deprecate
 */
// export function Inject(_target: any) { }

export function Header(name: string, value: string) {
  return (target: any, k: PropertyKey) => {
    setModalVar(target, k)
    mergeState(target, k, {
      header: { name, value },
    })
  }
}

export function Define(key: string, value: any) {
  return (target: any, k?: PropertyKey) => {
    if (k) {
      setModalVar(target, k)
      mergeState(target, k, {
        define: { [key]: value },
      })
    }
    else {
      setModalVar(target.prototype, '__CLASS')
      mergeState(target.prototype, '__CLASS', {
        define: { [key]: value },
      })
    }
  }
}

export * from './param'
export * from './route'
