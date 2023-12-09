export type ToInstance<T = any> = {
  [K in keyof T]: T[K] extends (new (...args: any) => any) ? InstanceType<T[K]> : void
}
