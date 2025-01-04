---
"phecda-client": major
"phecda-server": major
---

1. fix `getFileMid` in loader (support file name like `a.controller.dev.ts`)
2. support work with `electron`(as a kind of rpc),but queue won't work in electron
3. `createClient` should always be sync
4. add `eventemitter3`/`nanoid` to `phecda-client` 
5. rpc adaptor can interrupt default logic