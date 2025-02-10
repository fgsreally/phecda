import { RpcAdapter } from './client'

export function adaptor(exposed: string, opts: { channel?: string } = {}): RpcAdapter {
  const { channel = 'phecda-client' } = opts
  return () => {
    return {
      send({
        resolve,
        reject,
        data,
        isEvent,
      }) {
        if (isEvent) {
          (window as any)[exposed][`${channel}:send`](data)
        }

        else {
          (window as any)[exposed][`${channel}:invoke`](data).then((res: any) => {
            const { data, error } = res
            if (error)
              reject(data)

            else
              resolve(data)
          }).catch(reject)

          return true
        }
      },
    }
  }
}
