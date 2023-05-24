import type { P } from './types'

export class Meta {
  constructor(public data: P.Meta, public handlers: P.Handler[], public reflect: any[]) {

  }
}
