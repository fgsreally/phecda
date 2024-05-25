---
"phecda-server": patch
"phecda-client": patch
---

replace compiler with generator to provide better scalability
loader can read config from config file, it's more flexible to control loader function
it's a big change for both runtime and compile sysmtem
refact cli with `cac`; use esm format instead
`phecda-client` plugin support generator and config file
improve cli, remove `fs-extra`(instead with `unimport`)
add schema to config file