---
"phecda-server": patch
---

refactor hmr system to avoid case that module has different tag during writing code;
replace `del/add` with `replace` in `ServerPhecda`
fix parallel route bug;