# 日志

使用日志
```ts
import { log } from 'phecda-server'
log('hello world', 'info') // 输出日志，默认级别为log，可选级别：debug、info、log、warn、error、


```

修改默认日志：
```ts
setLogger(Logger)
```