class c {
  run() {
    return 'c'
  }
}
export abstract class BaseService<T extends new (...args: any) => any> {
  abstract fgs: InstanceType<T>
  find() {
    return 'find!'
  }
}

export class A extends BaseService<typeof c> {
  fgs = new c()
}
