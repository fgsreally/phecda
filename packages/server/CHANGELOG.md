# phecda-server

## 6.0.1

### Patch Changes

- 1bd14a9: add Search(route decorator like Get)

## 6.0.0

### Major Changes

- 831c910: release core v4

  1. refactor how meta is set and get
  2. refactor Phecda target structure
  3. remove some useless decorators

### Patch Changes

- Updated dependencies [831c910]
  - phecda-core@4.0.0

## 5.3.3

### Patch Changes

- 6f11209: freeze meta to make it inmutable (danger change)

## 5.3.2

### Patch Changes

- deb691d: support Mixin(can't extends metadata)

## 5.3.1

### Patch Changes

- c126577: add Empty to Base (turn class to Phecda class);

  remove Injectable from server to core

- Updated dependencies [c126577]
- Updated dependencies [c126577]
  - phecda-core@3.1.1

## 5.3.0

### Minor Changes

- f477841: add methods(`redirect/getCookie/setCookie/delCookie/setResHeaders/setResStatus`) to `HttpContext`

  add `HttpBase/RpcBase`

### Patch Changes

- Updated dependencies [f477841]
  - phecda-core@3.1.0

## 5.2.6

### Patch Changes

- a55a92f: move Base to core;

  replace Dev with ServerBase in phecda-server

  replace Base with WebBase in phecda-web

- a55a92f: refactor Factory, modelMap should be a WeakMap

  add `createPhecda`(=Factory)

- Updated dependencies [a55a92f]
  - phecda-core@3.0.2

## 5.2.5

### Patch Changes

- 865976b: only generate Code when NODE_ENV===development
- Updated dependencies [c18997a]
  - phecda-core@3.0.1

## 5.2.4

### Patch Changes

- 51391ef: legal override module won't output warning (it can't work in 5.2.3)

## 5.2.3

### Patch Changes

- 73ca668: fix resolve in loader (when ts resolver return undefined)

  valid overlay modules won't trigger warning

## 5.2.2

### Patch Changes

- 267ef58: fix init command when root is empty(rename workdir to root)

## 5.2.1

### Patch Changes

- 443b231: types in helper should be exposed at phecda-server

## 5.2.0

### Minor Changes

- 09bd238: create a singleton export for helper, it will keep ps export clear(mainly for unimport)

### Patch Changes

- 322a1cb: refactor cli and support workdir param (like `root` in `vite`)
- b62d3b5: support use multiple Ctx

## 5.1.1

### Patch Changes

- 3573cf9: ts.resolveModuleName fail in some cases; transform any absolute path to fileurl

## 5.1.1

### Patch Changes

- 4bee6d9: Ensure that the parameter order for bind and createClient in rpc matches the bind in the server

  rename bind to create in bullmq(it can't bind anything actually)

## 5.1.0

### Minor Changes

- e205e55: 1. refactor ps plugin; it must be a function that return value 2. refactor all bind in ps to clean code 3. add helper funciton `createControllerMetaMap` and `detectAopDep`(both with hmr support) 4. parallelRoute can be `false`

### Patch Changes

- 92ebfbd: remove getConfig/setConfig;
  add setLogger
  add custom config file option to cli
  add default path to Generator
- 46cee17: ensure the parameters of 'bind' in Fastify are consistent with others.

## 5.0.2

### Patch Changes

- 331a64b: fix TestHttp to support attach in supertest
- 1278f47: support virtualFile in ps.json

## 5.0.1

### Patch Changes

- 87550da: fix globalGuards/globalInterceptors logic (it will cause repeat and memory problem in hmr);support globalPipe and globalFilter"

## 5.0.0

### Major Changes

- fc8db58: there is too much simple fix and some functions seem useless in phecda;
  I think a break change is essential

### Minor Changes

- bf097a6: support kafka

### Patch Changes

- cedd44d: unimport support all .ts files
- 532ac3e: add Ctx to support inject context to custom property
- cc22f20: child process can exit correctly
- c792bef: rename `IS_DEV` to `IS_HMR`;
  fix `PS_FILE_RE`;
  fix spell in `TestFactory`
  add debug to all bind
  improve `detectAopDep`
  add `parseMeta` to `Factory`
  support `hono`/`elysia`(can't support full hmr)
  remove internal symbol and middleware which seems useless
  improve `interceptor`(it can intercept `PS` logic at now)
- f22a5bc: relaunch after error throwed and file changed
- e48766e: break change!
  refactor to support extends aop state and custom Controller
  it seems danger
- 6bbadaf: support bullmq/nats

  nats will respond empty object when using `@Event`

  (in Factory) add parseModule opts and use process.env.PS_HTTP_CODE/PS_RPC_CODE to generate code in default

- 370938e: fix kafka in rpc(but it seems slow and unstable,can't support hmr)
  change default clientQueue to support kafka
- a7d9a65: replace compiler with generator to provide better scalability
  loader can read config from config file, it's more flexible to control loader function
  it's a big change for both runtime and compile sysmtem
  refact cli with `cac`; use esm format instead
  `phecda-client` plugin support generator and config file
  improve cli, remove `fs-extra`(instead with `unimport`)
  add schema to config file
- cf59f17: rename PPlugin to PAddon
- 2f11e38: replace fs.watch with chokidar
- 26f29d7: loader can redirect import path to http/rpc code path(only when set env PS_HTTP_CODE/PS_RPC_CODE),it will be helpful for types
- 3554ca7: unimport can collect workspace export (when install fast-glob)
- 07816fb: add generics to PPlugin
- 42172dc: renmae Rpc to Event;support bullmq
- d4186ff: only subscribe the same queue once in rpc
  client generate a queue named `PS:hostname-pId`(only one queue) to collect data from server
- 1cc36e2: ps cli support nodejs command line args
- 949a013: loader can't resolve entry file(.ts) correctly in some cases
- df556a5: add destroy to Factory
- 5c782ce: fix fastify export to make sure tsup work
  Rename `method` to `func` to ensure that it is distinct from the http request method and that the semantics are clear(break change actually)
  add error handler when parallel requests invoke a func/module that does not exist(no such error handling in rpc)
  Remove the ability to create files from the command line
  Remove isolateSet in `Factory`,`Isolate` seems useless in phecda-server
  add `code` command to generate code during ci
- 358bdb4: add more internal dependences
  decorator `Arg` doesn't need arguments
- e031030: add init command to init tsconfig
- 090b742: cli can relaunch even throw unhandle promise/uncaugth exception
- 1233fd0: fix Mix to support internal abstract class like PGuard...
- 8dafb4d: add defaultValue to Param decorator and default pipe;
  remove pipeOpts on `Pipe`, all options should get from `ctx`(use `Define`)
- 048b9ee: can set NODE_ENV when using phecda-server/register
- 185be69: add config to Dev for modular;auto import can be banned(process.env.PS_NO_DTS)
- 6920888: fix elysia types and add elysia specific decorator
  fix fastify params
  add Shebang to bin
- 3c8cb67: add CustomResponse and improve types
- 12d8d62: refactor parallel route; tag in PS must be string;all context should has both tag and method
- 2e80166: support auto import
- dc4d00b: TestHttp return a supertest agent
- 9c89c0e: refactor rpc, add Queue to support custom queue;(methods on the same module use the same queue in default)
  add timeout for rpc client
- 380bcb0: add data to http ctx
- 074a815: model=class and module=instance
- 6b5b307: refactor types system
- 43983af: rename addon to Plugin;add query/body/params/headers/index to ctx;remove parallel from ctx
- 2665dd1: rename PModule with PExtension
- 3847605: add warn to all aop function
- 2ddaef9: support hyper-express; add example
- e812a14: exception status default to 0 (work for timer or internal error that filter can't catch); filter in both http/rpc should get status
  add TimerException/WorkerException
- c5cb4d6: add ctx to Err;
  add next to ctx in koa/express
- 9e90730: format uniqueue id in rpc for debug
- 99481b4: fix P.res types;it will auto invoke toJSON function (only in types)
- 8e0575c: add helper to help build custom framework
  refactor Context (it only provide a method `run`)
- 2b70fdf: Pipe can decorate method and class;add PS_LOG_LEVEL;add more debug info for aop
  Define can decorate method/class/params(work for `Pipe`)
- 9fa9507: add Mix
- Updated dependencies [f25189c]
- Updated dependencies [37bdc86]
- Updated dependencies [b041748]
- Updated dependencies [c40fece]
- Updated dependencies [e8582aa]
- Updated dependencies [e254263]
- Updated dependencies [d1f7041]
- Updated dependencies [c9445c6]
- Updated dependencies [79484c3]
- Updated dependencies [b041748]
- Updated dependencies [c6427b1]
- Updated dependencies [7b0d6fa]
- Updated dependencies [c2c6a5f]
- Updated dependencies [671fbc9]
- Updated dependencies [4621244]
- Updated dependencies [f83af88]
- Updated dependencies [5a477d0]
- Updated dependencies [ad47e7b]
- Updated dependencies [671fbc9]
- Updated dependencies [dbb599a]
- Updated dependencies [074a815]
- Updated dependencies [3fd911a]
- Updated dependencies [aefd80c]
- Updated dependencies [7242bb6]
- Updated dependencies [8f35d74]
- Updated dependencies [fc8db58]
  - phecda-core@3.0.0

## 5.0.0-beta.34

### Patch Changes

- 8e0575c: add helper to help build custom framework
  refactor Context (it only provide a method `run`)

## 5.0.0-beta.33

### Patch Changes

- e48766e: break change!
  refactor to support extends aop state and custom Controller
  it seems danger
- Updated dependencies [c2c6a5f]
  - phecda-core@3.0.0-beta.17

## 5.0.0-beta.32

### Patch Changes

- a7d9a65: replace compiler with generator to provide better scalability
  loader can read config from config file, it's more flexible to control loader function
  it's a big change for both runtime and compile sysmtem
  refact cli with `cac`; use esm format instead
  `phecda-client` plugin support generator and config file
  improve cli, remove `fs-extra`(instead with `unimport`)
  add schema to config file

## 5.0.0-beta.31

### Patch Changes

- 2b70fdf: Pipe can decorate method and class;add PS_LOG_LEVEL;add more debug info for aop
  Define can decorate method/class/params(work for `Pipe`)

## 5.0.0-beta.30

### Patch Changes

- 8dafb4d: add defaultValue to Param decorator and default pipe;
  remove pipeOpts on `Pipe`, all options should get from `ctx`(use `Define`)
- 3c8cb67: add CustomResponse and improve types

## 5.0.0-beta.29

### Patch Changes

- 6920888: fix elysia types and add elysia specific decorator
  fix fastify params
  add Shebang to bin

## 5.0.0-beta.28

### Patch Changes

- c792bef: rename `IS_DEV` to `IS_HMR`;
  fix `PS_FILE_RE`;
  fix spell in `TestFactory`
  add debug to all bind
  improve `detectAopDep`
  add `parseMeta` to `Factory`
  support `hono`/`elysia`(can't support full hmr)
  remove internal symbol and middleware which seems useless
  improve `interceptor`(it can intercept `PS` logic at now)

## 5.0.0-beta.27

### Patch Changes

- 5c782ce: fix fastify export to make sure tsup work
  Rename `method` to `func` to ensure that it is distinct from the http request method and that the semantics are clear(break change actually)
  add error handler when parallel requests invoke a func/module that does not exist(no such error handling in rpc)
  Remove the ability to create files from the command line
  Remove isolateSet in `Factory`,`Isolate` seems useless in phecda-server
  add `code` command to generate code during ci
- e812a14: exception status default to 0 (work for timer or internal error that filter can't catch); filter in both http/rpc should get status
  add TimerException/WorkerException

## 5.0.0-beta.26

### Patch Changes

- 6bbadaf: support bullmq/nats

  nats will respond empty object when using `@Event`

  (in Factory) add parseModule opts and use process.env.PS_HTTP_CODE/PS_RPC_CODE to generate code in default

- 370938e: fix kafka in rpc(but it seems slow and unstable,can't support hmr)
  change default clientQueue to support kafka
- 42172dc: renmae Rpc to Event;support bullmq
- d4186ff: only subscribe the same queue once in rpc
  client generate a queue named `PS:hostname-pId`(only one queue) to collect data from server

## 5.0.0-beta.25

### Patch Changes

- 26f29d7: loader can redirect import path to http/rpc code path(only when set env PS_HTTP_CODE/PS_RPC_CODE),it will be helpful for types
- 12d8d62: refactor parallel route; tag in PS must be string;all context should has both tag and method
- 9c89c0e: refactor rpc, add Queue to support custom queue;(methods on the same module use the same queue in default)
  add timeout for rpc client

## 5.0.0-beta.24

### Patch Changes

- Updated dependencies [b041748]
- Updated dependencies [b041748]
  - phecda-core@3.0.0-beta.16

## 5.0.0-beta.23

### Patch Changes

- Updated dependencies [79484c3]
  - phecda-core@3.0.0-beta.15

## 5.0.0-beta.22

### Patch Changes

- 2ddaef9: support hyper-express; add example

## 5.0.0-beta.21

### Patch Changes

- 3554ca7: unimport can collect workspace export (when install fast-glob)
- 380bcb0: add data to http ctx
- 6b5b307: refactor types system

## 5.0.0-beta.20

### Patch Changes

- 532ac3e: add Ctx to support inject context to custom property
- 074a815: model=class and module=instance
- Updated dependencies [074a815]
  - phecda-core@3.0.0-beta.14

## 5.0.0-beta.19

### Patch Changes

- e031030: add init command to init tsconfig
- Updated dependencies [d1f7041]
- Updated dependencies [5a477d0]
- Updated dependencies [aefd80c]
  - phecda-core@3.0.0-beta.13

## 5.0.0-alpha.18

### Patch Changes

- 1233fd0: fix Mix to support internal abstract class like PGuard...
- Updated dependencies [671fbc9]
- Updated dependencies [671fbc9]
  - phecda-core@3.0.0-alpha.12

## 5.0.0-alpha.17

### Patch Changes

- c5cb4d6: add ctx to Err;
  add next to ctx in koa/express
- Updated dependencies [c6427b1]
- Updated dependencies [7b0d6fa]
- Updated dependencies [4621244]
- Updated dependencies [dbb599a]
  - phecda-core@3.0.0-alpha.11

## 5.0.0-alpha.16

### Patch Changes

- Updated dependencies [e254263]
  - phecda-core@3.0.0-alpha.10

## 5.0.0-alpha.15

### Patch Changes

- Updated dependencies [3fd911a]
  - phecda-core@3.0.0-alpha.9

## 5.0.0-alpha.14

### Patch Changes

- 43983af: rename addon to Plugin;add query/body/params/headers/index to ctx;remove parallel from ctx
- Updated dependencies [37bdc86]
  - phecda-core@3.0.0-alpha.8

## 5.0.0-alpha.13

### Patch Changes

- dc4d00b: TestHttp return a supertest agent
- 99481b4: fix P.res types;it will auto invoke toJSON function (only in types)
- Updated dependencies [c9445c6]
- Updated dependencies [ad47e7b]
  - phecda-core@3.0.0-alpha.7

## 5.0.0-alpha.12

### Patch Changes

- 3847605: add warn to all aop function
- Updated dependencies [7242bb6]
  - phecda-core@3.0.0-alpha.6

## 5.0.0-alpha.11

### Patch Changes

- df556a5: add destroy to Factory
- 9fa9507: add Mix
- Updated dependencies [e8582aa]
  - phecda-core@3.0.0-alpha.5

## 5.0.0-alpha.10

### Patch Changes

- Updated dependencies [f83af88]
  - phecda-core@3.0.0-alpha.4

## 5.0.0-alpha.9

### Patch Changes

- cf59f17: rename PPlugin to PAddon
- 07816fb: add generics to PPlugin
- Updated dependencies [f25189c]
  - phecda-core@3.0.0-alpha.3

## 5.0.0-alpha.8

### Patch Changes

- Updated dependencies [c40fece]
  - phecda-core@3.0.0-alpha.2

## 5.0.0-alpha.7

### Minor Changes

- bf097a6: support kafka

### Patch Changes

- 9e90730: format uniqueue id in rpc for debug

## 5.0.0-alpha.6

### Patch Changes

- 2f11e38: replace fs.watch with chokidar

## 5.0.0-alpha.5

### Patch Changes

- cedd44d: unimport support all .ts files
- f22a5bc: relaunch after error throwed and file changed

## 5.0.0-alpha.4

### Major Changes

- fc8db58: there is too much simple fix and some functions seem useless in phecda;
  I think a break change is essential

### Patch Changes

- Updated dependencies [fc8db58]
  - phecda-core@3.0.0-alpha.1

## 4.1.2-alpha.3

### Patch Changes

- 949a013: loader can't resolve entry file(.ts) correctly in some cases
- 185be69: add config to Dev for modular;auto import can be banned(process.env.PS_NO_DTS)
- 2665dd1: rename PModule with PExtension

## 4.1.2-alpha.2

### Patch Changes

- Updated dependencies [8f35d74]
  - phecda-core@2.1.2-alpha.0

## 4.1.2-alpha.1

### Patch Changes

- cc22f20: child process can exit correctly
- 1cc36e2: ps cli support nodejs command line args
- 090b742: cli can relaunch even throw unhandle promise/uncaugth exception
- 048b9ee: can set NODE_ENV when using phecda-server/register

## 4.1.2-alpha.0

### Patch Changes

- 2e80166: support auto import

## 4.1.1

### Patch Changes

- 83852de: default filter only log error in development
- 83852de: plugin can work in h3 at now

## 4.1.0

### Minor Changes

- ebd39d9: bind tag to ctx (actually is a break change);all aop items should be updated

### Patch Changes

- ebc39e7: inject watcher only when there is not watcher

## 4.0.7

### Patch Changes

- 6b6036a: add pickFunc to improve types support when using request
- 9670308: add getConfig/setConfig
- d052702: improve TestHttp flexible;
  refactor bind in fastfiy to unified writing;
- Updated dependencies [99b458d]
  - phecda-core@2.1.1

## 4.0.6

### Patch Changes

- 3b8cdb2: fix server ctx types
- 2eaa6c9: export log
- 1ace514: module tag can be set by constructor param or Tag
- 67dbaa0: add named filter/Filter works for specific controller
- 5545b71: remove useless types;fix modules types;add PModule
- a94e1ad: phecda-server won't send data again if data is sent in interceptor/filter
- 6339ce6: refactor filter; rename error symbol in server filter

## 4.0.5

### Patch Changes

- 14c59db: split update to add+del

## 4.0.4

### Patch Changes

- a917678: refactor hmr to support multple factory
- 46e66e7: fix Pipe
- 1797c5a: register can handle .ts file from dynamic import(file url import)

## 4.0.3

### Patch Changes

- 67b18e3: add more files accept hmr
- 05e3e1b: server won't auto response if it response manually before

## 4.0.2

### Patch Changes

- beb4651: add plugin module(but types support is not strong)
- 9353ac8: support koa
- 3bf4785: add emitter to Dev Module

## 4.0.1

### Patch Changes

- 47c806c: Watcher will auto remove eventlistener when unmount even without Dev
- c0c623f: constructor on module should only work for DI
- d95a596: add isAopDepInject
- 325a774: named pipe will throw Error when pipe is not exists in strict mode(like guard/interceptor)
- d95a596: add Empty to aop module(to make sure those class is phecda module)

## 4.0.0

### Major Changes

- a21fb11: server will generate code directly;client only resolve import path
- e719809: bk change to refactor Context/Pipe/Interceptor;
  guard/interceptor/pipe will work for function(not request);
  each function will has its own context(won't share)
- f6096c3: add redis/rabbitmq

### Minor Changes

- da1a0bb: remove series request and refactor parallel request
- ba96778: refactor Middle to Plugin
- 0b3c856: refactor Factory to support hmr
- 90b0534: interceptor can provide cache function
- 33bc4b3: add cli command (in stdin); perf log
- 9b2ac7a: support fastify
- 0b3c856: add node loader to support hmr

### Patch Changes

- 108bea7: add moduleResolute(NodeNext) to resolve ts
- 9b2ac7a: rpc and server use the same namespace. it means that guards/interceptor/pipe/filter will be shared
- cdbd666: support @Head to input request header
- ce19faf: TestHttp can handle string/object response
- 1dd0831: node-loader should handle dynamic import from phecda-server
- 738ef7a: add test utils
- 95a0564: contextData includes type(express/redis/rabbitmq)
- f8d38b5: server only create route when http.type is defined(with any http decorator) in express
- de7cf57: support event mode in rpc
- da1a0bb: support h3
- 474587f: server still work even when specific interceptor/guard/middleware doesn't exist (set process.env.PS_STRICT will avoid it)
- fae8d80: add cli command to run a child process for entry file hmr
- f6096c3: client will throw error when invoke method which is not exposed or not allowed(in rpc)
- 20fbfdb: a module will only warn once for synonym
- 1dd0831: improve log
- 738ef7a: bind modulemap and meta to express
- 1dd0831: moduleGraph should depends on tag(not class instance)
- 7bca1f5: add debug and log to help debug
- fae8d80: bind in express support hmr
- 738ef7a: won't output metaFile if file is empty
- 95a0564: add context to rpc
- 9c023e7: rename symbol and global function. bind modulemap/metat to req
- e43bc19: stdin can relaunch/exit process (even in windows)
- ec66a44: support multple pipe
- da1a0bb: http compiler will pass args
- Updated dependencies [4c4c45a]
- Updated dependencies [ec66a44]
- Updated dependencies [de7cf57]
- Updated dependencies [de7cf57]
- Updated dependencies [1dd0831]
  - phecda-core@2.1.0

## 4.0.0-alpha.11

### Patch Changes

- ec66a44: support multple pipe
- Updated dependencies [ec66a44]
  - phecda-core@2.1.0-alpha.2

## 4.0.0-alpha.10

### Minor Changes

- da1a0bb: remove series request and refactor parallel request

### Patch Changes

- da1a0bb: support h3
- da1a0bb: http compiler will pass args

## 4.0.0-alpha.9

### Patch Changes

- de7cf57: support event mode in rpc
- Updated dependencies [4c4c45a]
- Updated dependencies [de7cf57]
- Updated dependencies [de7cf57]
  - phecda-core@2.1.0-alpha.1

## 4.0.0-alpha.8

### Minor Changes

- 9b2ac7a: support fastify

### Patch Changes

- 9b2ac7a: rpc and server use the same namespace. it means that guards/interceptor/pipe/filter will be shared

## 4.0.0-alpha.7

### Patch Changes

- 95a0564: contextData includes type(express/redis/rabbitmq)
- f8d38b5: server only create route when http.type is defined(with any http decorator) in express
- 95a0564: add context to rpc

## 4.0.0-alpha.6

### Major Changes

- a21fb11: server will generate code directly;client only resolve import path
- e719809: bk change to refactor Context/Pipe/Interceptor;
  guard/interceptor/pipe will work for function(not request);
  each function will has its own context(won't share)
- f6096c3: add redis/rabbitmq

### Patch Changes

- f6096c3: client will throw error when invoke method which is not exposed or not allowed(in rpc)

## 3.2.0-alpha.5

### Minor Changes

- 33bc4b3: add cli command (in stdin); perf log

### Patch Changes

- 108bea7: add moduleResolute(NodeNext) to resolve ts
- ce19faf: TestHttp can handle string/object response
- 20fbfdb: a module will only warn once for synonym

## 3.2.0-alpha.4

### Patch Changes

- 738ef7a: add test utils
- 738ef7a: bind modulemap and meta to express
- 738ef7a: won't output metaFile if file is empty

## 3.2.0-alpha.3

### Patch Changes

- cdbd666: support @Head to input request header

## 3.2.0-alpha.2

### Patch Changes

- 474587f: server still work even when specific interceptor/guard/middleware doesn't exist (set process.env.PS_STRICT will avoid it)
- 9c023e7: rename symbol and global function. bind modulemap/metat to req
- e43bc19: stdin can relaunch/exit process (even in windows)

## 3.2.0-alpha.1

### Patch Changes

- 1dd0831: node-loader should handle dynamic import from phecda-server
- 1dd0831: improve log
- 1dd0831: moduleGraph should depends on tag(not class instance)
- Updated dependencies [1dd0831]
  - phecda-core@2.0.1-alpha.0

## 3.2.0-alpha.0

### Minor Changes

- 0b3c856: refactor Factory to support hmr
- 0b3c856: add node loader to support hmr

### Patch Changes

- fae8d80: add cli command to run a child process for entry file hmr
- 7bca1f5: add debug and log to help debug
- fae8d80: bind in express support hmr

## 3.1.0

### Minor Changes

- 58cd33b: refactor pipe parameter

### Patch Changes

- 58cd33b: add warn to make sure that the parameters in the front position have a decorator (in controller method )

## 3.0.3

### Patch Changes

- 37058c7: add modulemap to serverContext for guard/interceptor
- 37058c7: clean constructorMap to support mult instance

## 3.0.2

### Patch Changes

- 8fc9844: add warner and remove useless dep

## 3.0.1

### Patch Changes

- e0af42f: default filter will console.error
- e0af42f: actually it is a break change for merge request: support global guard and interceptor, invoke useGuard/useInterceptor/usePost only once(not include useFilter) during a request
- a217f88: default pipe will transform arg by validate option when reflect doesn't exist

## 3.0.0

### Major Changes

- 78cb57a: refactor namespace structor to avoid namespace population

### Patch Changes

- 8fe5ced: pipe add ctx params
- Updated dependencies [d6d2146]
- Updated dependencies [049c138]
- Updated dependencies [78cb57a]
- Updated dependencies [a701f34]
- Updated dependencies [25cf638]
- Updated dependencies [eec80a6]
- Updated dependencies [64c2f70]
- Updated dependencies [8fe5ced]
  - phecda-core@2.0.0

## 3.0.0-alpha.7

### Patch Changes

- Updated dependencies [a701f34]
  - phecda-core@2.0.0-alpha.7

## 3.0.0-alpha.6

### Patch Changes

- Updated dependencies [25cf638]
  - phecda-core@2.0.0-alpha.6

## 3.0.0-alpha.5

### Patch Changes

- Updated dependencies [eec80a6]
  - phecda-core@2.0.0-alpha.5

## 3.0.0-alpha.4

### Patch Changes

- Updated dependencies [d6d2146]
  - phecda-core@2.0.0-alpha.4

## 3.0.0-alpha.3

### Patch Changes

- Updated dependencies [049c138]
  - phecda-core@2.0.0-alpha.3

## 3.0.0-alpha.2

### Patch Changes

- 8fe5ced: pipe add ctx params
- Updated dependencies [8fe5ced]
  - phecda-core@2.0.0-alpha.2

## 3.0.0-alpha.1

### Patch Changes

- Updated dependencies [64c2f70]
  - phecda-core@2.0.0-alpha.1

## 3.0.0-alpha.0

### Major Changes

- 78cb57a: refactor namespace structor to avoid namespace population

### Patch Changes

- Updated dependencies [78cb57a]
  - phecda-core@2.0.0-alpha.0

## 2.1.4

### Patch Changes

- 8f5ec1b: Query support empty key

## 2.1.3

### Patch Changes

- Updated dependencies [8022370]
  - phecda-core@1.7.0

## 2.1.2

### Patch Changes

- 7c5f176: circular dep and multple modules with same tag will cause the same error

## 2.1.1

### Patch Changes

- d78c82a: support bind express.Router

## 2.1.0

### Minor Changes

- 2daabb8: add Provide and Inject

### Patch Changes

- 9904e92: add Empty
- Updated dependencies [2daabb8]
  - phecda-core@1.6.0

## 2.0.3

### Patch Changes

- b7dd58a: default pipe only transform Number and Boolean

## 2.0.2

### Patch Changes

- 40e7ec2: fix decorators type, to support custom pipe

## 2.0.1

### Patch Changes

- Updated dependencies [538d86f]
  - phecda-core@1.5.0

## 2.0.0

### Major Changes

- b85e32b: split phecda-server to phecda-client(axios) phecda-server(express) phecda-rabbitmq(rabbitmq)

## 1.5.1

### Patch Changes

- 8863b8a: Define can bind class

## 1.5.0

### Minor Changes

- 4b67e98: refactor types to a namespace

### Patch Changes

- Updated dependencies [4b67e98]
  - phecda-core@1.4.1

## 1.4.1

### Patch Changes

- 0c7cbcb: create client request template
- Updated dependencies [263a6a7]
  - phecda-core@1.4.0

## 1.4.0

### Minor Changes

- de84e23: add Base/Meta
- de84e23: rename meta to context

### Patch Changes

- 3ee5ef0: add more exception and improve types support
- caab8b6: remove type prefix
- Updated dependencies [caab8b6]
  - phecda-core@1.3.1

## 1.3.0

### Minor Changes

- f13c1e9: remove **TAG** to prototype, avoid pollution in namespace

### Patch Changes

- caa829e: add useC to support constructor parameters, work for types
- caa829e: support Tag in server,it actually can't work before this version
- caa829e: default pipe in server can handle NaN correctly
- b1c5edf: fix Factory types
- caa829e: program won't crash in vite during hmr(danger)
- Updated dependencies [f13c1e9]
  - phecda-core@1.3.0

## 1.2.4

### Patch Changes

- 4273f22: replace vite plugin with unplugin,add output method in Factory
- 4273f22: change defaultpipe content
- Updated dependencies [4273f22]
  - phecda-core@1.2.1

## 1.2.3

### Patch Changes

- 5143c0c: vite plugin will create an independent bundle in build command

## 1.2.2

### Patch Changes

- Updated dependencies [9b91e2f]
  - phecda-core@1.2.0

## 1.2.1

### Patch Changes

- 0f357e7: support Tag
- 522aaa2: make up for Middle and change part of decorators format

## 1.2.0

### Minor Changes

- 639928b: support client request for rabbitmq (just simple one ,not for exchange),support parallel request for axios

## 1.1.1

### Patch Changes

- 0b46788: add support for watcher
- add types limit to Watcher, must be declared in a type file
- Updated dependencies
- Updated dependencies [0b46788]
  - phecda-core@1.1.1

## 1.1.0

### Minor Changes

- support rabbitmq !!

## 1.0.3

### Patch Changes

- b39b47b: add PRes to support custom post-interceptor(work for types)
- 589aaad: Clear and Ignore will work in each situation
- Updated dependencies [589aaad]
  - phecda-core@1.1.0

## 1.0.2

### Patch Changes

- support @Init and parse Factory to async
- Updated dependencies
  - phecda-core@1.0.8

## 1.0.1

### Patch Changes

- add series request and refactor server logic (includes guards/interceptors/middleware)
- Updated dependencies [a60ca7e]
  - phecda-core@1.0.7

## 1.0.1

### Patch Changes

- Updated dependencies
  - phecda-core@1.0.6
