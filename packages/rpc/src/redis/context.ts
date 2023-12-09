import type { P } from 'phecda-server'
import { BaseContext } from 'phecda-server'
export const guardsRecord = {} as Record<string, P.Guard<void>>

export const interceptorsRecord = {} as Record<string, P.Interceptor<void>>

export const singletonConf = {
  // @ts-expect-error miss type
  pipe: args => args.map(({ arg }) => arg),
  filter: () => false,
}
export class Context extends BaseContext<null> {
  singletonConf = singletonConf
  interceptorsRecord = interceptorsRecord
  guardsRecord = guardsRecord
}
