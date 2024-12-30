export function HttpRequest(send: () => Promise<any>, abort: () => void) {
  let resolve: (value: any) => void
  let reject: (reason?: any) => void

  let isSend = false

  class PromiseWrapper extends Promise<any> {
    then(...args: any) {
      this.send()
      return super.then(...args)
    }

    send() {
      if (isSend)
        return
      isSend = true
      send().then(resolve).catch(reject)
    }

    abort() {
      if (!isSend)
        return

      try {
        abort()
      }
      catch (e) {
        reject(e)
      }
    }
  }
  const promise: any = new PromiseWrapper((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  return promise
}

export function RpcRequest(send: () => Promise<any>) {
  let resolve: (value: any) => void
  let reject: (reason?: any) => void

  let isSend = false

  class PromiseWrapper extends Promise<any> {
    then(...args: any) {
      this.send()
      return super.then(...args)
    }

    send() {
      if (isSend)
        return
      isSend = true
      send().then(resolve).catch(reject)
    }
  }
  const promise: any = new PromiseWrapper((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  return promise
}
