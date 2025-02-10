import { RpcAdapter } from './client'

export function adaptor(ws: WebSocket): RpcAdapter {
  return ({ receive }) => {
    return {
      init() {
        ws.addEventListener('message', (e) => {
          receive(JSON.parse(e.data))
        })
      },
      send({
        data,
      }) {
        ws.send(JSON.stringify(data))
      },
    }
  }
}
