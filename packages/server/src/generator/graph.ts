import { getTag } from 'phecda-core'
import type { Meta } from '../meta'
import { Generator } from './utils'

export class GraphGenerator extends Generator {
  ext = '.mmd'// 文件扩展名
  name = 'Graph'
  generateCode(meta: Meta[]): string {
    const edges = new Set<string>()
    const nodes = new Set<string>()
    meta.forEach(({ model }) => {
      const from = String(getTag(model))
      nodes.add(from)
      const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', model) || []
      paramTypes.forEach((dep) => {
        const to = String(getTag(dep))
        if (to && to !== from) {
          nodes.add(to)
          edges.add(`${to} --> ${from}`)
        }
      })
    })
    let result = 'graph TD\n'
    // 先输出所有节点，防止孤立节点丢失
    nodes.forEach((n) => {
      result += `    ${String(n)}\n`
    })
    edges.forEach((e) => {
      result += `    ${e}\n`
    })
    return result
  }
}
