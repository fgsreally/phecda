---
"phecda-react": major
---

 using `reflect-metadata` and `Proxy`

 refactor to ensure `vue/react/web` structor is similar to `phecda-server`

 only keep simple hook like `useR`

 Add `usePhecda` hook for advanced operations

 Follow the provide/inject (vue) and context(react) pattern to support `ssr`

 `init` handler won't exec in ssr