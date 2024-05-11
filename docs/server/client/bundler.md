




# 构建工具

以`vite`为例，利用插件：
```ts
import client from 'phecda-client/vite'

export default defineConfig({
  plugins: [client({ http: './pmeta.js' })],
})
```
> 基于`unplugin`，`webpack、vite`均可行


它会将所有`*.controller.ts`都指向`./pmeta.js`

