import { setModelVar, setState } from 'phecda-core'
/**
 *
 * @deprecate
 */
// export function Inject(_target: any) { }

export function Header(name: string, value: string) {
  return (target: any, k: PropertyKey) => {
    setModelVar(target, k)
    setState(target, k, {
      header: { name, value },
    })
  }
}

export function Define(key: string, value: any) {
  return (target: any, k?: PropertyKey) => {
    if (k) {
      setModelVar(target, k)
      setState(target, k, {
        define: { [key]: value },
      })
    }
    else {
      setModelVar(target.prototype, '__CLASS')
      setState(target.prototype, '__CLASS', {
        define: { [key]: value },
      })
    }
  }
}

export * from './param'
export * from './route'
