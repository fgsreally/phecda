---
"phecda-server": patch
---

exception status default to 0 (work for timer or internal error that filter can't catch); filter in both http/rpc should get status
add TimerException/WorkerException