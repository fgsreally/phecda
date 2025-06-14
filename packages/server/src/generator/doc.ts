import type { ControllerMetaData, Meta } from '../meta'
import { Generator } from './utils'

export class DocGenerator extends Generator {
  name = 'DOC'
  classMap: Record<string, { [key: string]: {
    doc: string
    params: {
      doc: string
      index: number
    }[]
  } }> = {}

  constructor(path?: string) {
    super(path || '.ps/doc.json')
  }

  getContent() {
    return JSON.stringify(this.classMap)
  }

  addMethod(data: ControllerMetaData) {
    const {
      name, func,
    } = data
    if (!data.rawMeta.doc)
      return

    if (!this.classMap[name])
      this.classMap[name] = {}
    this.classMap[name][func] = {
      doc: data.rawMeta.doc,
      params: data.params.filter(item => item.rawMeta.doc).map((item) => {
        return {
          doc: item.rawMeta.doc,
          index: item.index,
        }
      }),
    }
  }

  generateCode(meta: Meta[]): string {
    meta.forEach(({ data }) => {
      if (data.controller)
        this.addMethod(data as ControllerMetaData)
    })
    return this.getContent()
  }
}
