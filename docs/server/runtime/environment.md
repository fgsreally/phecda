# 环境变量

1. `NODE_ENV`为非`development`时，禁止热更新
2. `PS_LOG_LEVEL`  `info/log/warning/error` 对应0到3，只有高于`PS_LOG_LEVEL`的信息才会被输出
3. `PS_STRICT` 如果设置，那么使用了未设置的守卫、管道等，会直接报错
4. `PS_BAN_CLI_LOG`设置了的话，禁止命令行的日志输出
5. `PS_CONFIG_FILE` 配置文件的路径，默认为`ps.json`
6. `PS_DTS_PATH`类型文件的路径，默认为`ps.d.ts`
7. `PS_APP_NAME`应用名，在默认日志中显示
8. `PS_GENERATE`只生成代码，不运行