import type { PluginOption } from 'vite'
import { unplugin } from './unplugin'
export default unplugin.vite as (options?: { localPath?: string | undefined } | undefined) => PluginOption
