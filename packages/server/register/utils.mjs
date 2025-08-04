import { basename } from 'path'
import { transform } from '@swc-node/core'
import psExports from './export.mjs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const injectInlineSourceMap = ({ code, map }) => {
    if (map) {
        const base64Map = Buffer.from(map, 'utf8').toString('base64')
        const sourceMapContent = `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${base64Map}`
        return `${code}\n${sourceMapContent}`
    }
    return code
}

export async function compile(sourcecode, url, config = {}) {
    if (url.endsWith('.d.ts'))
        return ''

    const filename = path.basename(url.startsWith('file:') ? fileURLToPath(url) : url)

    const { code, map } = await transform(sourcecode, filename, {
        module: 'es6',
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        esModuleInterop: false,
        sourcemap:false,
        ...config
    })
    return injectInlineSourceMap({ code, map })
}

export async function genUnImportRet(opts) {
    try {
        const { createUnimport } = await
            import('unimport')
        return createUnimport({
            ...opts,

            presets: [{
                from: 'phecda-server',
                imports: psExports,
            },]
                .concat(opts.presets || []),
        })
    } catch (e) {
        return false
    }
}

export function handleClassTypes(input) {
    return input.replace(/const\s+(\w+)\s*:\s*typeof\s+import\(['"](.+)['"]\)\['(\w+)'\]/g, (_, n, p, e) => {
        // TestController in test.controller
        if (p.startsWith('./') && (basename(p).replace('.', '').toLowerCase() === e.toLowerCase()))
            return `${_}\n  type ${n} = InstanceType<typeof import('${p}')['${e}']>`

        return _
    })
}
export function slash(str) {
    return str.replace(/\\/g, '/')
}