import fse from 'fs-extra'
import type { Meta } from '../meta'
export abstract class Generator {
  private _path: string
  constructor(
    path?: string,
  ) {
    if (path)
      this._path = path
  }

  abstract name: string

  get path() {
    return this._path || `.ps/${this.name.toLowerCase()}.js`
  }

  abstract generateCode(meta: Meta[]): string

  async output(meta: Meta[]) {
    await fse.outputFile(this.path, this.generateCode(meta))
  }
}
