import type { PHandler, ServerMeta } from './types'

export class Pmeta {
  constructor(public data: ServerMeta, public handlers: PHandler[], public reflect: any[]) {

  }
}
