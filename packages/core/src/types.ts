export interface PhecdaNameSpace {
  [name: string]: Phecda
}

export interface UsePipeOptions {
  transform: boolean
  collectError: boolean
}

export interface PhecdaHandler {
  init?: (instance: Phecda,) => any
  validate?: (instance: Phecda,) => string | void
  pipe?: (instance: Phecda,) => void
  error?: any
  watch?: any
  rule?: any
  info?: any
  ignore?: boolean
  meta?: any
  beforeUnload?: (instance: Phecda) => any
  beforeLoad?: (instance: Phecda, v: any) => any
}

export interface Phecda {
  _namespace: {

    __TAG__: string

    __INIT_EVENT__: Set<PropertyKey>

    __EXPOSE_VAR__: Set<PropertyKey>

    __IGNORE_VAR__: Set<PropertyKey>

    __STATE_VAR__: Set<PropertyKey>

    __STATE_HANDLER__: Map<PropertyKey, PhecdaHandler[]>
  }
}

export type ClassValue<I> = {
  [P in keyof I]: I[P] extends Function ? undefined : I[P];
}
