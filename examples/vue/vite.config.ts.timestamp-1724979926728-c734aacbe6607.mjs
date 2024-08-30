// vite.config.ts
import { URL, fileURLToPath } from "node:url";
import { defineConfig } from "file:///D:/MyProject/2024/5/phecda/node_modules/.pnpm/vite@4.5.3_@types+node@18.19.39/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/MyProject/2024/5/phecda/node_modules/.pnpm/@vitejs+plugin-vue@4.6.2_vite@4.5.3_vue@3.4.30/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import swc from "file:///D:/MyProject/2024/5/phecda/node_modules/.pnpm/unplugin-swc@1.4.5_@swc+core@1.6.5/node_modules/unplugin-swc/dist/index.mjs";
var __vite_injected_original_import_meta_url = "file:///D:/MyProject/2024/5/phecda/examples/vue/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    // devtools(),
    swc.vite({})
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  build: {
    rollupOptions: {
      external: ["vue", "vue-router"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxNeVByb2plY3RcXFxcMjAyNFxcXFw1XFxcXHBoZWNkYVxcXFxleGFtcGxlc1xcXFx2dWVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXE15UHJvamVjdFxcXFwyMDI0XFxcXDVcXFxccGhlY2RhXFxcXGV4YW1wbGVzXFxcXHZ1ZVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovTXlQcm9qZWN0LzIwMjQvNS9waGVjZGEvZXhhbXBsZXMvdnVlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgVVJMLCBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnXG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCBzd2MgZnJvbSAndW5wbHVnaW4tc3djJ1xuLy8gaW1wb3J0IGRldnRvb2xzIGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZS1kZXZ0b29scydcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbdnVlKCksXG4gICAgLy8gZGV2dG9vbHMoKSxcbiAgICBzd2Mudml0ZSh7XG4gICAgfSldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFsndnVlJywgJ3Z1ZS1yb3V0ZXInXSxcbiAgICB9LFxuICB9LFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVQsU0FBUyxLQUFLLHFCQUFxQjtBQUV4VixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxTQUFTO0FBSm1MLElBQU0sMkNBQTJDO0FBT3BQLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUFDLElBQUk7QUFBQTtBQUFBLElBRVosSUFBSSxLQUFLLENBQ1QsQ0FBQztBQUFBLEVBQUM7QUFBQSxFQUNKLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUMsT0FBTyxZQUFZO0FBQUEsSUFDaEM7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
