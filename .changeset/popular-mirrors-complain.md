---
"phecda-server": major
---

1. remove `interceptor`, refactor `guard`, current `guard` can replace old guard and interceptor.

2. rename `plugin` to `addon`(because of vscode types), make it behave consistently across different frameworks( work on `router`,only for http)

3.  priority decide the `guard/addon` order

4.  Each function with an HTTP decorator corresponds to a `router`, and the implementation varies across different frameworks.