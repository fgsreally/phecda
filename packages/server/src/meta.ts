import type { P } from './types'

export class Meta {
  constructor(public data: P.MetaData, public handlers: P.Handler[], public paramsType: any[]) {

  }
}
