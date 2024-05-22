import { SHARE_KEY, getOwnState, setState, setStateKey } from 'phecda-core'

export function setPropertyState(target: any, k: undefined | PropertyKey, setter: (state: Record<string, any>) => void) {
  if (!k) {
    k = SHARE_KEY
    target = target.prototype
  }
  setStateKey(target, k)
  const state = getOwnState(target, k) || {}
  setter(state)
  //   state.pipe = key
  setState(target, k, state)
}
