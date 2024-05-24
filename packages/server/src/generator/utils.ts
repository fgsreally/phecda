import fs from 'fs'
import type { Meta, MetaData } from '../meta'
export abstract class Generator {
  constructor(
    public path: string,
  ) { }

  abstract name: string

  abstract generateCode(meta: MetaData[]): string

  async output(meta: Meta[]) {
    await fs.promises.writeFile(this.path, this.generateCode(meta.map(item => item.data)))
  }
}
