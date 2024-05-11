---
"phecda-server": patch
---

rename `IS_DEV` to `IS_HMR`;
fix `PS_FILE_RE`;
fix spell in `TestFactory`
add debug to all bind
improve `detectAopDep`
add `parseMeta` to `Factory`
support `hono`/`elysia`(can't support full hmr)
remove internal symbol and middleware which seems useless