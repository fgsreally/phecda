# phecda-server

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
