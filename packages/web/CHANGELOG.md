# phecda-web

## 3.0.13

### Patch Changes

- Updated dependencies [75d6eec]
  - phecda-core@5.2.1

## 3.0.12

### Patch Changes

- Updated dependencies [0f0b589]
  - phecda-core@5.2.0

## 3.0.11

### Patch Changes

- Updated dependencies [ae849ae]
  - phecda-core@5.1.1

## 3.0.10

### Patch Changes

- Updated dependencies [55c20f0]
  - phecda-core@5.1.0

## 3.0.9

### Patch Changes

- Updated dependencies [991e477]
  - phecda-core@5.0.1

## 3.0.8

### Patch Changes

- Updated dependencies [dfb547d]
  - phecda-core@5.0.0

## 3.0.7

### Patch Changes

- Updated dependencies [c8c46b6]
  - phecda-core@4.5.1

## 3.0.6

### Patch Changes

- Updated dependencies [6e44723]
  - phecda-core@4.5.0

## 3.0.5

### Patch Changes

- Updated dependencies [3f674bc]
  - phecda-core@4.4.0

## 3.0.4

### Patch Changes

- Updated dependencies [bee529f]
  - phecda-core@4.3.0

## 3.0.3

### Patch Changes

- Updated dependencies [f6025c7]
- Updated dependencies [2ffe1d4]
  - phecda-core@4.2.0

## 3.0.2

### Patch Changes

- Updated dependencies [4d5cc84]
- Updated dependencies [dd27622]
- Updated dependencies [d8fdd4e]
- Updated dependencies [c1b7d65]
  - phecda-core@4.1.0

## 3.0.2-alpha.2

### Patch Changes

- Updated dependencies [4d5cc84]
  - phecda-core@4.1.0-alpha.2

## 3.0.2-alpha.1

### Patch Changes

- Updated dependencies [dd27622]
  - phecda-core@4.1.0-alpha.1

## 3.0.2-alpha.0

### Patch Changes

- Updated dependencies [c1b7d65]
  - phecda-core@4.1.0-alpha.0

## 3.0.1

### Patch Changes

- bffb0a0: move wait from web to core
- d382585: won't export isObject
- Updated dependencies [bffb0a0]
  - phecda-core@4.0.1

## 3.0.0

### Major Changes

- 831c910: release core v4

  1. refactor how meta is set and get
  2. refactor Phecda target structure
  3. remove some useless decorators

### Patch Changes

- Updated dependencies [831c910]
  - phecda-core@4.0.0

## 2.0.8

### Patch Changes

- 9a6341e: export getParamtypes

  support Mixin(can't extends metadata)

## 2.0.7

### Patch Changes

- Updated dependencies [c126577]
- Updated dependencies [c126577]
  - phecda-core@3.1.1

## 2.0.6

### Patch Changes

- Updated dependencies [f477841]
  - phecda-core@3.1.0

## 2.0.5

### Patch Changes

- a55a92f: move Base to core;

  replace Dev with ServerBase in phecda-server

  replace Base with WebBase in phecda-web

- f9578f7: add `then` on `Webphecda` to support use createPhecda(in react or vue) with `await`

  fix `bindMethod`, `constructor` should be excluded

- Updated dependencies [a55a92f]
  - phecda-core@3.0.2

## 2.0.4

### Patch Changes

- Updated dependencies [c18997a]
  - phecda-core@3.0.1

## 2.0.3

### Patch Changes

- 8f2fe66: add mitt emitter to Webphecda to support flexible operation

  rename `origin` on `WebPhecda` to `memory`

- 8f2fe66: add namespace to support phecda-vue/phecda-react work in the same app

  namespace should be a Map

## 2.0.2

### Patch Changes

- 34513a7: add defaultPhecda to support pure browser environment (not in ssr/nodejs)

## 2.0.1

### Patch Changes

- 37148d6: update sth to support phecda-react

  refactor `Shallow` in `phecda-vue`

## 2.0.0

### Major Changes

- remove filter in `phecda-vue`

  refactor `useV` in `phecda-vue`, cache is managed by `useV` itself, not Phecda instance

  using `reflect-metadata` and `Proxy`

  refactor to ensure `vue/react/web` structor is similar to `phecda-server`

  only keep simple hook like `useR`

  Add `usePhecda` hook for advanced operations

  Follow the provide/inject (vue) and context(react) pattern to support `ssr`

  `init` handler won't exec in ssr

## 1.0.1

### Patch Changes

- 120716e: refactor: remove all map;use cache/origin/state instead
- e254263: add types for watcher and storage when injectProperty;add toJSON/toString to Storage;fix Storage logic"
- 43cc4e9: add isModuleLoad
- b041748: fix and refactor Storage; fix getTag
- 074a815: model=class and module=instance
- 9c83eae: add warn when using the same tag module
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

## 1.0.1-beta.14

### Patch Changes

- Updated dependencies [c2c6a5f]
  - phecda-core@3.0.0-beta.17

## 1.0.1-beta.13

### Patch Changes

- b041748: fix and refactor Storage; fix getTag
- Updated dependencies [b041748]
- Updated dependencies [b041748]
  - phecda-core@3.0.0-beta.16

## 1.0.1-beta.12

### Patch Changes

- Updated dependencies [79484c3]
  - phecda-core@3.0.0-beta.15

## 1.0.1-beta.11

### Patch Changes

- 074a815: model=class and module=instance
- Updated dependencies [074a815]
  - phecda-core@3.0.0-beta.14

## 1.0.1-beta.10

### Patch Changes

- Updated dependencies [d1f7041]
- Updated dependencies [5a477d0]
- Updated dependencies [aefd80c]
  - phecda-core@3.0.0-beta.13

## 1.0.1-alpha.9

### Patch Changes

- Updated dependencies [671fbc9]
- Updated dependencies [671fbc9]
  - phecda-core@3.0.0-alpha.12

## 1.0.1-alpha.8

### Patch Changes

- Updated dependencies [c6427b1]
- Updated dependencies [7b0d6fa]
- Updated dependencies [4621244]
- Updated dependencies [dbb599a]
  - phecda-core@3.0.0-alpha.11

## 1.0.1-alpha.7

### Patch Changes

- 120716e: refactor: remove all map;use cache/origin/state instead
- e254263: add types for watcher and storage when injectProperty;add toJSON/toString to Storage;fix Storage logic"
- 43cc4e9: add isModuleLoad
- Updated dependencies [e254263]
  - phecda-core@3.0.0-alpha.10

## 1.0.1-alpha.6

### Patch Changes

- Updated dependencies [3fd911a]
  - phecda-core@3.0.0-alpha.9

## 1.0.1-alpha.5

### Patch Changes

- Updated dependencies [37bdc86]
  - phecda-core@3.0.0-alpha.8

## 1.0.1-alpha.4

### Patch Changes

- 9c83eae: add warn when using the same tag module
- Updated dependencies [c9445c6]
- Updated dependencies [ad47e7b]
  - phecda-core@3.0.0-alpha.7

## 1.0.1-alpha.3

### Patch Changes

- Updated dependencies [7242bb6]
  - phecda-core@3.0.0-alpha.6

## 1.0.1-alpha.2

### Patch Changes

- Updated dependencies [e8582aa]
  - phecda-core@3.0.0-alpha.5

## 1.0.1-alpha.1

### Patch Changes

- Updated dependencies [f83af88]
  - phecda-core@3.0.0-alpha.4

## 1.0.1-alpha.0

### Patch Changes

- Updated dependencies [f25189c]
  - phecda-core@3.0.0-alpha.3
