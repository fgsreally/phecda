import { RpcAdapter } from './client'

export function adaptor(): RpcAdapter {
  return () => {
    return {
      send({
        resolve,
        reject,
        data,
        isEvent,
      }) {
        if (isEvent) {
          chrome.runtime.sendMessage(data)
        }

        else {
          chrome.runtime.sendMessage(data, (response) => {
            const { data, error } = response
            if (error)
              reject(data)

            else
              resolve(data)
          })

          return true
        }
      },
    }
  }
}
