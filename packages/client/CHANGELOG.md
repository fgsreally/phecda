# phecda-client

## 3.0.0

### Major Changes

- 3d96e49: add createClient and remove other api
  support custom fetch
- e928c0a: 1. move rpc client from `phecda-server` to `phecda-client` 2. fix batch request 3. refactor http and rpc client with `createClient` and `adaptor` 4. add `send` and `abort` to http request, add `send` to rpc request 5. support `alova` as http adaptor
- 98a92ba: 1. fix `getFileMid` in loader (support file name like `a.controller.dev.ts`) 2. support work with `electron`(as a kind of rpc),but queue won't work in electron 3. `createClient` should always be sync 4. add `eventemitter3`/`nanoid` to `phecda-client` 5. rpc adaptor can interrupt default logic

### Minor Changes

- 05ddbe1: add OneFile and ManyFiles to server,support form-data in client
- 6f6a48a: 1. support `ws` (deprecate [phecda-ws](https://github.com/fgsreally/phecda-ws)) 2. fix resolve hook in loader(for hmr)

### Patch Changes

- e761625: unplugin won't work/throw error when there is not ps.json(config file)

  server will restart when add/change config file(only in vite)

- 4b81529: refactor `CustomResponse`

  `client` no longer depends on `server` in any way

  ensure frontend project only need to install `phecda-client` package(without `phecda-server`)

- b351985: remove BaseError from server
  change pkg export for bundler

## 3.0.0-alpha.4

### Patch Changes

- b351985: remove BaseError from server
  change pkg export for bundler

## 3.0.0-alpha.3

### Patch Changes

- 4b81529: refactor `CustomResponse`

  `client` no longer depends on `server` in any way

  ensure frontend project only need to install `phecda-client` package(without `phecda-server`)

## 3.0.0-alpha.2

### Major Changes

- 98a92ba: 1. fix `getFileMid` in loader (support file name like `a.controller.dev.ts`) 2. support work with `electron`(as a kind of rpc),but queue won't work in electron 3. `createClient` should always be sync 4. add `eventemitter3`/`nanoid` to `phecda-client` 5. rpc adaptor can interrupt default logic

### Minor Changes

- 6f6a48a: 1. support `ws` (deprecate [phecda-ws](https://github.com/fgsreally/phecda-ws)) 2. fix resolve hook in loader(for hmr)

## 3.0.0-alpha.1

### Major Changes

- e928c0a: 1. move rpc client from `phecda-server` to `phecda-client` 2. fix batch request 3. refactor http and rpc client with `createClient` and `adaptor` 4. add `send` and `abort` to http request, add `send` to rpc request 5. support `alova` as http adaptor

## 2.1.2-alpha.0

### Patch Changes

- e761625: unplugin won't work/throw error when there is not ps.json(config file)

  server will restart when add/change config file(only in vite)

## 3.0.0-alpha.0

### Major Changes

- 3d96e49: add createClient and remove other api
  support custom fetch

## 2.1.1

### Patch Changes

- 1bd14a9: fix createReq to support custom request method

## 2.1.0

### Minor Changes

- 483c6fa: support workdir in `ps`

  (too much change in `ps` so it has to be a minor release)

## 2.0.4

### Patch Changes

- 920450a: refact phecda-client unplugin to support rpc
- ae64f33: plugin can handle .rpc.ts
- a7d9a65: replace compiler with generator to provide better scalability
  loader can read config from config file, it's more flexible to control loader function
  it's a big change for both runtime and compile sysmtem
  refact cli with `cac`; use esm format instead
  `phecda-client` plugin support generator and config file
  improve cli, remove `fs-extra`(instead with `unimport`)
  add schema to config file
- 082f2af: createChainReq can change the parallel route
- b9c1bfe: isError(null) should be false
- 6b5b307: refactor types system
- c563af1: add Expand/ExpandRecursively types
  client only export import api

## 2.0.4-beta.5

### Patch Changes

- b9c1bfe: isError(null) should be false

## 2.0.4-beta.4

### Patch Changes

- a7d9a65: replace compiler with generator to provide better scalability
  loader can read config from config file, it's more flexible to control loader function
  it's a big change for both runtime and compile sysmtem
  refact cli with `cac`; use esm format instead
  `phecda-client` plugin support generator and config file
  improve cli, remove `fs-extra`(instead with `unimport`)
  add schema to config file

## 2.0.4-beta.3

### Patch Changes

- 082f2af: createChainReq can change the parallel route

## 2.0.4-beta.2

### Patch Changes

- 920450a: refact phecda-client unplugin to support rpc

## 2.0.4-beta.1

### Patch Changes

- 6b5b307: refactor types system
- c563af1: add Expand/ExpandRecursively types
  client only export import api

## 2.0.4-alpha.0

### Patch Changes

- ae64f33: plugin can handle .rpc.ts

## 2.0.3

### Patch Changes

- 6b6036a: add pickFunc to improve types support when using request

## 2.0.2

### Patch Changes

- 12a7881: update error symobol in isError

## 2.0.1

### Patch Changes

- 8d7f7f2: add toClass

## 2.0.0

### Major Changes

- a21fb11: server will generate code directly;client only resolve import path

### Minor Changes

- da1a0bb: remove series request and refactor parallel request

### Patch Changes

- cdbd666: support @Head to input request header
- 20fbfdb: can resolve params correctly
- 2314083: replace query with axios params

## 2.0.0-alpha.4

### Minor Changes

- da1a0bb: remove series request and refactor parallel request

## 2.0.0-alpha.3

### Patch Changes

- 2314083: replace query with axios params

## 2.0.0-alpha.2

### Major Changes

- a21fb11: server will generate code directly;client only resolve import path

## 1.2.3-alpha.1

### Patch Changes

- 20fbfdb: can resolve params correctly

## 1.2.3-alpha.0

### Patch Changes

- cdbd666: support @Head to input request header

## 1.2.2

### Patch Changes

- a217f88: remove null and undefined in request

## 1.2.1

### Patch Changes

- 02850c2: delete batchStack after chainReq promise finish( or it will cause puzzling problem)

## 1.2.0

### Minor Changes

- c507f78: add createChainRequest
- 6033ec7: chain req support batch

### Patch Changes

- d6d2146: only createReq when batch is false

## 1.2.0-alpha.1

### Patch Changes

- d6d2146: only createReq when batch is false

## 1.2.0-alpha.0

### Minor Changes

- c507f78: add createChainRequest
- 6033ec7: chain req support batch

## 1.1.6

### Patch Changes

- b8caae4: AsyncReturnToJson may cause types infinite , remove it from useC

## 1.1.5

### Patch Changes

- 48e0f9b: improve useC type, to make sure the response won't include function/symbol

## 1.1.4

### Patch Changes

- 6f87795: support empty key, all parameters in controller must have decorator

## 1.1.3

### Patch Changes

- c412cc9: fix toAsync type

## 1.1.2

### Patch Changes

- 34e74ab: fix emitFile in vite

## 1.1.1

### Patch Changes

- 0ad3128: fix vite plugin type and support .route

## 1.1.0

### Minor Changes

- 40e7ec2: add interval and port options to support poll

## 1.0.2

### Patch Changes

- b6c5853: vite devserver can't work when client import server

## 1.0.1

### Patch Changes

- 2a2665a: add toAsync
