---
"phecda-server": patch
---

fix fastify export to make sure tsup work
Rename `method` to `func` to ensure that it is distinct from the http request method and that the semantics are clear(break change actually)
add error handler when parallel requests invoke a func/module that does not exist(no such error handling in rpc)
Remove the ability to create files from the command line
Remove isolateSet in `Factory`,`Isolate` seems useless in phecda-server
add `code` command to generate code during ci