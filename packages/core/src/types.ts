export interface NameSpace {
  [name: string]: Phecda
}

export interface InjectData {
  [key: string]: any

}

export interface Handler {
  [key: string]: any
  // init?: (instance: any) => any
  // pipe?: (instance: any) => void
  // rule?: RegExp | string | Function | number
  // info?: string
  // meta?: any
  // error?: any
  // http?: any
}
export interface Phecda {
  prototype: any
  _namespace: {


    __EXPOSE_VAR__: Set<PropertyKey>

    __IGNORE_VAR__: Set<PropertyKey>

    __STATE_VAR__: Set<PropertyKey>

    __STATE_HANDLER__: Map<PropertyKey, Handler[]>

    __STATE_NAMESPACE__: Map<PropertyKey, Object>
  }
}

export type ClassValue<I> = {
  [P in keyof I]: I[P] extends Function ? undefined : I[P];
}

export interface Events {

}
