import { IS_DEV } from './common'
export function HMR(cb: (...args: any) => any) {
  if (IS_DEV)
    globalThis.__PS_HMR__?.push(cb)
}
