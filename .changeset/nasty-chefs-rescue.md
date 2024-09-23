---
"phecda-server": minor
---

actually is a break-change
1. remove `createPhecda` (web and server should have different api for fullstack development)
2. refactor `Factory`(with `ServerPhecda`) to make sure there is an unified structure in both web and server
3. add `useS` to get `ServerPhecda`(or `module`) to support flexible action