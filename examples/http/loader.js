// cross-env PS_LOADER_PATH=./loader.js pnpm express
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { parse } from 'yaml'
export async function load(url) {
  if (url.endsWith('.yaml')) {
    const content = await readFile(fileURLToPath(url), 'utf-8')

    return `export default ${JSON.stringify(parse(content))}`
  }
}
