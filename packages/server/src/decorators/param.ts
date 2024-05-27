import { setPropertyState } from 'phecda-core'

export function BaseParam(data: Record<string, any>): ParameterDecorator {
  return (target: any, k: PropertyKey | undefined, index: number) => {
    if (!k)
      return
    setPropertyState(target, k, (state) => {
      if (!state.params)
        state.params = []

      const existItem = state.params.find((item: any) => item.index === index)
      if (existItem)
        Object.assign(existItem, data)

      else
        state.params.push({ ...data, index })
    })
  }
}

export function Body(key = '') {
  return BaseParam({
    type: 'body',
    key,
  })
}
// req.headers
export function Head(key: string) {
  return BaseParam({
    type: 'headers', key: key.toLowerCase(),
  })
}

export function Query(key = '') {
  return BaseParam({ type: 'query', key })
}
export function Param(key: string) {
  return BaseParam({
    type: 'params', key,
  })
}

// work for micro service
export function Arg() {
  return BaseParam({
    type: 'params', key: '',
  })
}
