# phecda-vue

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
