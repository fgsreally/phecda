import { IS_HMR } from './common'
export function HMR(cb: (...args: any) => any) {
  if (IS_HMR)
    globalThis.__PS_HMR__?.push(cb)
}
