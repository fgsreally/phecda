# phecda-core

## 4.3.0

### Minor Changes

- bee529f: setMeta(class A) directly;
  add `pick`

## 4.2.0

### Minor Changes

- f6025c7: add init to Base

### Patch Changes

- 2ffe1d4: fix setMeta for more flexible cases

## 4.1.0

### Minor Changes

- 4d5cc84: add omit
- d8fdd4e: move rule decorator(only inject meta to class) from megrez-schema to phecda-core
  add `partial`
- c1b7d65: add objectToClass/functionToClass

### Patch Changes

- dd27622: If an error occurs during `invoke`, output the error message

## 4.1.0-alpha.2

### Minor Changes

- 4d5cc84: add omit

## 4.1.0-alpha.1

### Patch Changes

- dd27622: If an error occurs during `invoke`, output the error message

## 4.1.0-alpha.0

### Minor Changes

- c1b7d65: add objectToClass/functionToClass

## 4.0.1

### Patch Changes

- bffb0a0: move wait from web to core

## 4.0.0

### Major Changes

- 831c910: release core v4

  1. refactor how meta is set and get
  2. refactor Phecda target structure
  3. remove some useless decorators

## 3.1.1

### Patch Changes

- c126577: add Empty to Base (turn class to Phecda class);

  remove Injectable from server to core

- c126577: phecda-core doesn't need ts metadata;

## 3.1.0

### Minor Changes

- f477841: refactor invokeHandler, it will add **PROMISE_SYMBOL** to instance directly

## 3.0.2

### Patch Changes

- a55a92f: move Base to core;

  replace Dev with ServerBase in phecda-server

  replace Base with WebBase in phecda-web

## 3.0.1

### Patch Changes

- c18997a: fix Global and Isolate

  add `If`

## 3.0.0

### Major Changes

- fc8db58: there is too much simple fix and some functions seem useless in phecda;
  I think a break change is essential

### Minor Changes

- dbb599a: transformClass support partial feature;rename classToValue to classToPlain(return json value)

### Patch Changes

- f25189c: move Isolate to core
- 37bdc86: add AbConstruct
- b041748: refactor set/get to keep it simple; rename getKey to getInject
- c40fece: move Construct from server to core; fix isPhecda types
- e8582aa: @Init can handle async function correctly
- e254263: add types for watcher and storage when injectProperty;add toJSON/toString to Storage;fix Storage logic"
- d1f7041: break change! add set/get;rename injectProperty/getProperty; refactor core.ts
  refactor Inject
- c9445c6: Tag support all propertyKeys
  add Unique(equal to Tag(symbol)),it can't work on http or rpc in `phecda-server`
- 79484c3: refactor to support Clear and Ignore(now it work intuitively) and reduce the number of assignments when get data from Phecda;

  rename all var to key

- b041748: fix and refactor Storage; fix getTag
- c6427b1: refact Isolate
- 7b0d6fa: fix addDecoToClass types
- c2c6a5f: add setPropertyState/getShareState for convenience
  add default param to getMeta
  fix Clear/Ignore
- 671fbc9: refactor functions in core.ts to support all module/instance/prototype
- 4621244: refactor Err logic;
  remove partial on transformClass;
  remove Nested
  change addDecoToClass params
- f83af88: remove getSymbol;getTag can handle both class(module) and instance now
- 5a477d0: refactor Effect
- ad47e7b: add Unmount and unmountParallel
- 671fbc9: add params to Err;add transformProperty
- 074a815: model=class and module=instance
- 3fd911a: remove registerSerial/registerParallel/unmountParallel,replace with invokeHandler
- aefd80c: refactor transform logic to decorator `To` and add decorator `Rule` to separate async transform and transform;
- 7242bb6: To support multiple callback
- 8f35d74: isPhecda can judge all exports from dynamic import

## 3.0.0-beta.17

### Patch Changes

- c2c6a5f: add setPropertyState/getShareState for convenience
  add default param to getMeta
  fix Clear/Ignore

## 3.0.0-beta.16

### Patch Changes

- b041748: refactor set/get to keep it simple; rename getKey to getInject
- b041748: fix and refactor Storage; fix getTag

## 3.0.0-beta.15

### Patch Changes

- 79484c3: refactor to support Clear and Ignore(now it work intuitively) and reduce the number of assignments when get data from Phecda;

  rename all var to key

## 3.0.0-beta.14

### Patch Changes

- 074a815: model=class and module=instance

## 3.0.0-beta.13

### Patch Changes

- d1f7041: break change! add set/get;rename injectProperty/getProperty; refactor core.ts
  refactor Inject
- 5a477d0: refactor Effect
- aefd80c: refactor transform logic to decorator `To` and add decorator `Rule` to separate async transform and transform;

## 3.0.0-alpha.12

### Patch Changes

- 671fbc9: refactor functions in core.ts to support all module/instance/prototype
- 671fbc9: add params to Err;add transformProperty

## 3.0.0-alpha.11

### Minor Changes

- dbb599a: transformClass support partial feature;rename classToValue to classToPlain(return json value)

### Patch Changes

- c6427b1: refact Isolate
- 7b0d6fa: fix addDecoToClass types
- 4621244: refactor Err logic;
  remove partial on transformClass;
  remove Nested
  change addDecoToClass params

## 3.0.0-alpha.10

### Patch Changes

- e254263: add types for watcher and storage when injectProperty;add toJSON/toString to Storage;fix Storage logic"

## 3.0.0-alpha.9

### Patch Changes

- 3fd911a: remove registerSerial/registerParallel/unmountParallel,replace with invokeHandler

## 3.0.0-alpha.8

### Patch Changes

- 37bdc86: add AbConstruct

## 3.0.0-alpha.7

### Patch Changes

- c9445c6: Tag support all propertyKeys
  add Unique(equal to Tag(symbol)),it can't work on http or rpc in `phecda-server`
- ad47e7b: add Unmount and unmountParallel

## 3.0.0-alpha.6

### Patch Changes

- 7242bb6: To support multiple callback

## 3.0.0-alpha.5

### Patch Changes

- e8582aa: @Init can handle async function correctly

## 3.0.0-alpha.4

### Patch Changes

- f83af88: remove getSymbol;getTag can handle both class(module) and instance now

## 3.0.0-alpha.3

### Patch Changes

- f25189c: move Isolate to core

## 3.0.0-alpha.2

### Patch Changes

- c40fece: move Construct from server to core; fix isPhecda types

## 3.0.0-alpha.1

### Major Changes

- fc8db58: there is too much simple fix and some functions seem useless in phecda;
  I think a break change is essential

## 2.1.2-alpha.0

### Patch Changes

- 8f35d74: isPhecda can judge all exports from dynamic import

## 2.1.1

### Patch Changes

- 99b458d: add pipeline

## 2.1.0

### Minor Changes

- 4c4c45a: bind Rule to Pipe
- de7cf57: add tag to Rule; add instance to Pipe

### Patch Changes

- ec66a44: rename Pipe to To
- de7cf57: add tag to rule preset
- 1dd0831: isPhecda should return true when class is decorated by any phecda-core decorator

## 2.1.0-alpha.2

### Patch Changes

- ec66a44: rename Pipe to To

## 2.1.0-alpha.1

### Minor Changes

- 4c4c45a: bind Rule to Pipe
- de7cf57: add tag to Rule; add instance to Pipe

### Patch Changes

- de7cf57: add tag to rule preset

## 2.0.1-alpha.0

### Patch Changes

- 1dd0831: isPhecda should return true when class is decorated by any phecda-core decorator

## 2.0.0

### Major Changes

- 78cb57a: refactor namespace structor to avoid namespace population

### Patch Changes

- d6d2146: Global will mount class in init handler
- 049c138: plainToClass support option rule
- a701f34: Inject won't throw error if not Provide
- 25cf638: fix Global when extend
- eec80a6: no essential to use Global before Tag
- 64c2f70: Rule support function info
- 8fe5ced: export all presets

## 2.0.0-alpha.7

### Patch Changes

- a701f34: Inject won't throw error if not Provide

## 2.0.0-alpha.6

### Patch Changes

- 25cf638: fix Global when extend

## 2.0.0-alpha.5

### Patch Changes

- eec80a6: no essential to use Global before Tag

## 2.0.0-alpha.4

### Patch Changes

- d6d2146: Global will mount class in init handler

## 2.0.0-alpha.3

### Patch Changes

- 049c138: plainToClass support option rule

## 2.0.0-alpha.2

### Patch Changes

- 8fe5ced: export all presets

## 2.0.0-alpha.1

### Patch Changes

- 64c2f70: Rule support function info

## 2.0.0-alpha.0

### Major Changes

- 78cb57a: refactor namespace structor to avoid namespace population

## 1.7.0

### Minor Changes

- 8022370: add Effect decorator

## 1.6.0

### Minor Changes

- 2daabb8: add Provide and Inject

## 1.5.0

### Minor Changes

- 538d86f: add Bind and getBind

## 1.4.1

### Patch Changes

- 4b67e98: rename P to Expose

## 1.4.0

### Minor Changes

- 263a6a7: add Assign to assign value to instance

## 1.3.1

### Patch Changes

- caab8b6: remove type prefix

## 1.3.0

### Minor Changes

- f13c1e9: remove **TAG** to prototype, avoid pollution in namespace

## 1.2.1

### Patch Changes

- 4273f22: external preset and add iife format bundle

## 1.2.0

### Minor Changes

- 9b91e2f: Storage is an 'inject' decorator like Watcher at now

## 1.1.1

### Patch Changes

- add types limit to Watcher, must be declared in a type file
- 0b46788: add option to watcher

## 1.1.0

### Minor Changes

- 589aaad: Clear and Ignore will work in each situation

## 1.0.8

### Patch Changes

- replace window with global,get with p

## 1.0.7

### Patch Changes

- a60ca7e: plainToClass can only validate or transform ,not both

## 1.0.6

### Patch Changes

- add isPhecda

## 1.0.5

### Patch Changes

- add window decorator

## 1.0.4

### Patch Changes

- add getTag utils

## 1.0.3

### Patch Changes

- 24e2f22: move all decorator to core and other pkg only need to inject property

## 1.0.2

### Patch Changes

- b119020: add more pipe and rule to core

## 1.0.1

### Patch Changes

- refactor:remove phecda-form code and part of phecda-core code to phecda-vue to make sure all content that is related to vue is in phecda-vue;remove package phecda-form
