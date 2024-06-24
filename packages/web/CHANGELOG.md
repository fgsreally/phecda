# phecda-web

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
