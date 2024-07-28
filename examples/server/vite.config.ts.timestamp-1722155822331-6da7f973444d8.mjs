// vite.config.ts
import { URL, fileURLToPath } from "node:url";
import { defineConfig } from "file:///D:/MyProject/2024/5/phecda/node_modules/.pnpm/vite@5.3.1_@types+node@18.19.39/node_modules/vite/dist/node/index.js";
import pc from "file:///D:/MyProject/2024/5/phecda/packages/client/dist/unplugin.mjs";
var __vite_injected_original_import_meta_url = "file:///D:/MyProject/2024/5/phecda/examples/server/vite.config.ts";
var vite_config_default = defineConfig({
  server: {
    proxy: {
      "/base": "http://localhost:3008"
    }
  },
  plugins: [
    pc.vite({})
    // ps.vite(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxNeVByb2plY3RcXFxcMjAyNFxcXFw1XFxcXHBoZWNkYVxcXFxleGFtcGxlc1xcXFxzZXJ2ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXE15UHJvamVjdFxcXFwyMDI0XFxcXDVcXFxccGhlY2RhXFxcXGV4YW1wbGVzXFxcXHNlcnZlclxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovTXlQcm9qZWN0LzIwMjQvNS9waGVjZGEvZXhhbXBsZXMvc2VydmVyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgVVJMLCBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnXHJcblxyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgcGMgZnJvbSAncGhlY2RhLWNsaWVudC91bnBsdWdpbidcclxuLy8gaW1wb3J0IHN3YyBmcm9tICd1bnBsdWdpbi1zd2MnXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcblxyXG4gIHNlcnZlcjoge1xyXG4gICAgcHJveHk6IHtcclxuICAgICAgJy9iYXNlJzogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwOCcsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcGMudml0ZSh7fSksXHJcbiAgICAvLyBwcy52aXRlKCksXHJcbiAgXSxcclxuXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThULFNBQVMsS0FBSyxxQkFBcUI7QUFFalcsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxRQUFRO0FBSDBMLElBQU0sMkNBQTJDO0FBSzFQLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBRTFCLFFBQVE7QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFNBQVM7QUFBQSxJQUNYO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUFBO0FBQUEsRUFFWjtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFFRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
