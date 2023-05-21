# phecda-server

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
