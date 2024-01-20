import type { P } from './types'

export class PMeta {
  constructor(public data: P.Meta, public handlers: P.Handler[], public paramsType: any[]) {

  }
}
