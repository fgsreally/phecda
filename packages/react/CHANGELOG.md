# phecda-react

## 2.0.13

### Patch Changes

- phecda-web@3.0.13

## 2.0.12

### Patch Changes

- phecda-web@3.0.12

## 2.0.11

### Patch Changes

- phecda-web@3.0.11

## 2.0.10

### Patch Changes

- phecda-web@3.0.10

## 2.0.9

### Patch Changes

- phecda-web@3.0.9

## 2.0.8

### Patch Changes

- phecda-web@3.0.8

## 2.0.7

### Patch Changes

- phecda-web@3.0.7

## 2.0.6

### Patch Changes

- phecda-web@3.0.6

## 2.0.5

### Patch Changes

- phecda-web@3.0.5

## 2.0.4

### Patch Changes

- phecda-web@3.0.4

## 2.0.3

### Patch Changes

- phecda-web@3.0.3

## 2.0.2

### Patch Changes

- phecda-web@3.0.2

## 2.0.2-alpha.2

### Patch Changes

- phecda-web@3.0.2-alpha.2

## 2.0.2-alpha.1

### Patch Changes

- phecda-web@3.0.2-alpha.1

## 2.0.2-alpha.0

### Patch Changes

- phecda-web@3.0.2-alpha.0

## 2.0.1

### Patch Changes

- Updated dependencies [bffb0a0]
- Updated dependencies [d382585]
  - phecda-web@3.0.1

## 2.0.0

### Major Changes

- 831c910: release core v4

  1. refactor how meta is set and get
  2. refactor Phecda target structure
  3. remove some useless decorators

### Patch Changes

- Updated dependencies [831c910]
  - phecda-web@3.0.0

## 1.0.7

### Patch Changes

- Updated dependencies [9a6341e]
  - phecda-web@2.0.8

## 1.0.6

### Patch Changes

- phecda-web@2.0.7

## 1.0.5

### Patch Changes

- phecda-web@2.0.6

## 1.0.4

### Patch Changes

- f9578f7: add param `models` to `createPhecda`
- Updated dependencies [a55a92f]
- Updated dependencies [f9578f7]
  - phecda-web@2.0.5

## 1.0.3

### Patch Changes

- phecda-web@2.0.4

## 1.0.2

### Patch Changes

- 8f2fe66: add namespace to support phecda-vue/phecda-react work in the same app

  namespace should be a Map

- Updated dependencies [8f2fe66]
- Updated dependencies [8f2fe66]
  - phecda-web@2.0.3

## 1.0.1

### Patch Changes

- b7ab24b: Functions starting with "use" must and can only be used inside the component.

  add `getR/getPhecda/getV` to work outside component

- 34513a7: add defaultPhecda to support pure browser environment (not in ssr/nodejs)
- Updated dependencies [34513a7]
  - phecda-web@2.0.2

## 1.0.0

### Major Changes

- 37148d6: using `reflect-metadata` and `Proxy`

  refactor to ensure `vue/react/web` structor is similar to `phecda-server`

  only keep simple hook like `useR`

  Add `usePhecda` hook for advanced operations

  Follow the provide/inject (vue) and context(react) pattern to support `ssr`

  `init` handler won't exec in ssr

### Patch Changes

- Updated dependencies [37148d6]
  - phecda-web@2.0.1

## 0.1.1

### Patch Changes

- Updated dependencies
  - phecda-web@2.0.0

## 0.1.0

### Minor Changes

- cf59f17: split part to web

### Patch Changes

- 120716e: refactor: remove all map;use cache/origin/state instead
- 6a55ac9: won't load module with tag that has been loaded before
- 074a815: model=class and module=instance
- 9c83eae: add warn when using the same tag module
- c258596: fix hmr problem
- Updated dependencies [120716e]
- Updated dependencies [e254263]
- Updated dependencies [43cc4e9]
- Updated dependencies [b041748]
- Updated dependencies [074a815]
- Updated dependencies [9c83eae]
  - phecda-web@1.0.1

## 0.1.0-beta.19

### Patch Changes

- phecda-web@1.0.1-beta.14

## 0.1.0-beta.18

### Patch Changes

- c258596: fix hmr problem

## 0.1.0-beta.17

### Patch Changes

- Updated dependencies [b041748]
  - phecda-web@1.0.1-beta.13

## 0.1.0-beta.16

### Patch Changes

- phecda-web@1.0.1-beta.12

## 0.1.0-beta.15

### Patch Changes

- 074a815: model=class and module=instance
- Updated dependencies [074a815]
  - phecda-web@1.0.1-beta.11

## 0.1.0-beta.14

### Patch Changes

- phecda-web@1.0.1-beta.10

## 0.1.0-alpha.13

### Patch Changes

- phecda-web@1.0.1-alpha.9

## 0.1.0-alpha.12

### Patch Changes

- phecda-web@1.0.1-alpha.8

## 0.1.0-alpha.11

### Patch Changes

- 120716e: refactor: remove all map;use cache/origin/state instead
- Updated dependencies [120716e]
- Updated dependencies [e254263]
- Updated dependencies [43cc4e9]
  - phecda-web@1.0.1-alpha.7

## 0.1.0-alpha.10

### Patch Changes

- phecda-web@1.0.1-alpha.6

## 0.1.0-alpha.9

### Patch Changes

- phecda-web@1.0.1-alpha.5

## 0.1.0-alpha.8

### Patch Changes

- 9c83eae: add warn when using the same tag module
- Updated dependencies [9c83eae]
  - phecda-web@1.0.1-alpha.4

## 0.1.0-alpha.7

### Patch Changes

- phecda-web@1.0.1-alpha.3

## 0.1.0-alpha.6

### Patch Changes

- phecda-web@1.0.1-alpha.2

## 0.1.0-alpha.5

### Patch Changes

- phecda-web@1.0.1-alpha.1

## 0.1.0-alpha.4

### Minor Changes

- cf59f17: split part to web

### Patch Changes

- phecda-web@1.0.1-alpha.0

## 0.0.1-alpha.3

### Patch Changes

- Updated dependencies [c40fece]
  - phecda-core@3.0.0-alpha.2

## 0.0.1-alpha.2

### Patch Changes

- 6a55ac9: won't load module with tag that has been loaded before

## 0.0.1-alpha.1

### Patch Changes

- Updated dependencies [fc8db58]
  - phecda-core@3.0.0-alpha.1

## 0.0.1-alpha.0

### Patch Changes

- Updated dependencies [8f35d74]
  - phecda-core@2.1.2-alpha.0
