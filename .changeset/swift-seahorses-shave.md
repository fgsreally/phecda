---
"phecda-react": major
"phecda-vue": major
"phecda-web": major
---

remove filter in `phecda-vue` 

refactor `useV` in `phecda-vue`, cache is managed by `useV` itself, not Core

using `reflect-metadata` and `proxy`

refactor to ensure `vue/react/web` structor is consistent with `phecda-server`

only keep simple hook like `useR`

Add `getActiveCore` for advanced operations

fix to support `ssr`