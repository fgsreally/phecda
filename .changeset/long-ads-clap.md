---
"phecda-server": patch
---

fix resolve hook in loader
1. `pathToFileURL` won't handle query correctly, 
2. No longer skips typescript resolving (node_modules) for now
