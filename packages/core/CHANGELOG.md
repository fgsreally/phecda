# phecda-core

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
