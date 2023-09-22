# phecda-vue

## 2.0.0-alpha.8

### Patch Changes

- e23c5fb: errorHandler work even in setter
- ebae9ea: filter return reactive will cause perf in some cases

## 2.0.0-alpha.7

### Patch Changes

- Updated dependencies [25cf638]
  - phecda-core@2.0.0-alpha.6

## 2.0.0-alpha.6

### Patch Changes

- Updated dependencies [eec80a6]
  - phecda-core@2.0.0-alpha.5

## 2.0.0-alpha.5

### Patch Changes

- Updated dependencies [d6d2146]
  - phecda-core@2.0.0-alpha.4

## 2.0.0-alpha.4

### Patch Changes

- c507f78: createTable support custom render(with props) and column group (only test arco and element-plus)
- c507f78: add useRaw

## 2.0.0-alpha.3

### Patch Changes

- Updated dependencies [049c138]
  - phecda-core@2.0.0-alpha.3

## 2.0.0-alpha.2

### Patch Changes

- Updated dependencies [8fe5ced]
  - phecda-core@2.0.0-alpha.2

## 2.0.0-alpha.1

### Patch Changes

- Updated dependencies [64c2f70]
  - phecda-core@2.0.0-alpha.1

## 2.0.0-alpha.0

### Major Changes

- 78cb57a: refactor namespace structor to avoid namespace population

### Patch Changes

- Updated dependencies [78cb57a]
  - phecda-core@2.0.0-alpha.0

## 1.6.3

### Patch Changes

- Updated dependencies [8022370]
  - phecda-core@1.7.0

## 1.6.2

### Patch Changes

- bf0eb81: add arco resolver

## 1.6.1

### Patch Changes

- Updated dependencies [2daabb8]
  - phecda-core@1.6.0

## 1.6.0

### Minor Changes

- 70e5f9d: filter support simple setter

## 1.5.7

### Patch Changes

- 6b13839: add delState to filter

## 1.5.6

### Patch Changes

- Updated dependencies [538d86f]
  - phecda-core@1.5.0

## 1.5.5

### Patch Changes

- fc0122f: remove PublicOnly

## 1.5.4

### Patch Changes

- Updated dependencies [4b67e98]
  - phecda-core@1.4.1

## 1.5.3

### Patch Changes

- 204539c: useV won't support readonly at now

## 1.5.2

### Patch Changes

- Updated dependencies [263a6a7]
  - phecda-core@1.4.0

## 1.5.1

### Patch Changes

- caab8b6: remove type prefix
- Updated dependencies [caab8b6]
  - phecda-core@1.3.1

## 1.5.0

### Minor Changes

- 57b0072: add createModal

### Patch Changes

- 57b0072: fix useV types
- 57b0072: input can override the default configuration

## 1.4.0

### Minor Changes

- f13c1e9: remove **TAG** to prototype, avoid pollution in namespace

### Patch Changes

- Updated dependencies [f13c1e9]
  - phecda-core@1.3.0

## 1.3.3

### Patch Changes

- 81c7a7c: add modal_props to returntype of createLayer

## 1.3.2

### Patch Changes

- Updated dependencies [4273f22]
  - phecda-core@1.2.1

## 1.3.1

### Patch Changes

- 63c4cd8: add support to \_mount and \_unmount

## 1.3.0

### Minor Changes

- 9b91e2f: Storage is an 'inject' decorator like Watcher at now

### Patch Changes

- Updated dependencies [9b91e2f]
  - phecda-core@1.2.0

## 1.2.10

### Patch Changes

- 2bcdd6b: if onUpdate exists .assignment won't work

## 1.2.9

### Patch Changes

- onUpdate should be executed before assignment

## 1.2.8

### Patch Changes

- property will be delete when \_active turn to false in form filter
- add onUpdate callback to createForm

## 1.2.7

### Patch Changes

- filter will transform array

## 1.2.6

### Patch Changes

- weakmap will make sth bad. remove setActivePhecda and weakmap for now

## 1.2.5

### Patch Changes

- 0b46788: support option once in watcher
- add types limit to Watcher, must be declared in a type file
- Updated dependencies
- Updated dependencies [0b46788]
  - phecda-core@1.1.1

## 1.2.4

### Patch Changes

- f50578a: createModal can inject props to warp component
- f50578a: fix types for createModal

## 1.2.3

### Patch Changes

- 589aaad: Clear and Ignore will work in each situation
- Updated dependencies [589aaad]
  - phecda-core@1.1.0

## 1.2.2

### Patch Changes

- Updated dependencies
  - phecda-core@1.0.8

## 1.2.1

### Patch Changes

- Updated dependencies [a60ca7e]
  - phecda-core@1.0.7

## 1.2.0

### Minor Changes

- add typescript support

### Patch Changes

- Updated dependencies
  - phecda-core@1.0.6

## 1.1.2

### Patch Changes

- add errorhandler to filter in vue

## 1.1.1

### Patch Changes

- rename symbol object in createPhecda
- Updated dependencies
  - phecda-core@1.0.5

## 1.1.0

### Minor Changes

- add symbol,then you can get model in window

### Patch Changes

- 5cdb2db: stop watching event before invoke app.unmount ,mainly for micro-frontend
- Updated dependencies
  - phecda-core@1.0.4

## 1.0.4

### Patch Changes

- 24e2f22: move all decorator to core and other pkg only need to inject property
- Updated dependencies [24e2f22]
  - phecda-core@1.0.3

## 1.0.3

### Patch Changes

- Updated dependencies [b119020]
  - phecda-core@1.0.2

## 1.0.2

### Patch Changes

- add scopeeffect to createfilter
- 0606626: add \_active property to createFormData
- 0606626: refactor : use effectscope to create computed data and use weakmap to cache function on model

## 1.0.1

### Patch Changes

- refactor:remove phecda-form code and part of phecda-core code to phecda-vue to make sure all content that is related to vue is in phecda-vue;remove package phecda-form
- Updated dependencies
  - phecda-core@1.0.1
  - vue@0.0.0
