# 环境变量与特殊标识

## 运行环境
### 环境变量
1. `PS_RUNTIME`,标记此时程序是通过`PS`专门的运行时启动的
2. `PS_LOG_LEVEL`  `info/log/warning/error` 对应0到3，只有高于`PS_LOG_LEVEL`的信息才会被输出
3. `PS_STRICT` 如果设置，那么使用了未设置的守卫、管道等，会直接报错
4. `PS_PURE` 如果设置，不会去检查守卫管道等
5. `PS_GENERATE`只生成代码，不运行
6. `PS_APP_NAME`应用名，在默认日志中显示


### 特殊标识
__PS_ERROR__,标记是否被`filter`处理，即请求是否出错
__PS_HMR__，给热更新调用的回调
`PS_EXIT_CODE`,传给运行时的退出类型



## 命令行/运行时
### 环境变量
1. `PS_BAN_CLI_LOG`设置了的话，禁止命令行的日志输出
2. `PS_CONFIG_FILE` 配置文件的路径，默认为`ps.json`
3. `PS_DTS_PATH`类型文件的路径，默认为`ps.d.ts`
4. `PS_PORT_RELEASE_DELAY`为等待端口释放的时长，默认为50
5. `PS_DISABLE_WATCH` 禁止监听文件变化，禁止运行时的热更新
6. `PS_LOADER_PATH`，详见`examples/http/loader.js`
> 因为暂时没有找到方法确认进程结束后端口是否释放，只好手动延时（如果没有用到服务端框架则无所谓）