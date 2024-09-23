---
"phecda-server": patch
---

`setLogger` can overwrite internal log logic(`LOG_LEVEL` only work in default logger)
add `getLogger`(it will return undefined if not `setLogger` before)