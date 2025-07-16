import type { ControllerMetaData, Meta } from '../meta'
import { Generator } from './utils'

export class RPCGenerator extends Generator {
  name = 'RPC'
  classMap: Record<string, { [key: string]: string }> = {}

  getContent() {
    let content = ''

    for (const name in this.classMap) {
      content += `
        export class ${name}{
            ${Object.values(this.classMap[name]).reduce((p, c) => p + c)}
            }`
    }
    return content
  }

  addMethod(args: ControllerMetaData) {
    const {
      rpc, name, method, tag,
    } = args

    if (!rpc)
      return
    if (!this.classMap[name])
      this.classMap[name] = {}
    this.classMap[name][method] = `
    ${method}(){
      return {tag:'${tag as string}',method:"${method}",isEvent:${!!rpc.isEvent},queue:"${rpc.queue || ''}"}

    }
    `
  }

  generateCode(meta: Meta[]): string {
    // for (const i of meta) {
    //   if (i.controller === 'rpc')
    //     this.addMethod(i as ControllerMetaData)
    // }
    meta.forEach(({ data }) => {
      if (data.controller === 'rpc')
        this.addMethod(data as ControllerMetaData)
    })
    return this.getContent()
  }
}
