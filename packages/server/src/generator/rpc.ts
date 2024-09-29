import type { ControllerMetaData, MetaData } from '../meta'
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
      rpc, name, func, tag,
    } = args

    if (!rpc)
      return
    if (!this.classMap[name])
      this.classMap[name] = {}
    this.classMap[name][func] = `
    ${func}(){
      return {tag:'${tag as string}',func:"${func}",isEvent:${!!rpc.isEvent},queue:"${rpc.queue || ''}"}

    }
    `
  }

  generateCode(meta: MetaData[]): string {
    for (const i of meta) {
      if (i.controller === 'rpc')
        this.addMethod(i as ControllerMetaData)
    }
    return this.getContent()
  }
}
