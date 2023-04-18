export class Phistroy {
  guard: string[] = []
  interceptor: string[] = []
  record(name: string, type: 'guard' | 'interceptor') {
    if (!this[type].includes(name)) {
      this[type].push(name)
      return true
    }
    return false
  }
}
