import { setMeta } from 'phecda-core'

export function BaseParam(data: Record<string, any>): ParameterDecorator {
  return (target: any, property: PropertyKey | undefined, index: number) => {
    if (!property)
      return

    setMeta(target, property, index, data)
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
export function Arg(target: any, k: string, index: number) {
  BaseParam({
    type: 'args', key: `${index}`,
  })(target, k, index)
}
