# phecda-vue

## 5.2.0-alpha.2

### Patch Changes

- phecda-web@3.0.2-alpha.2

## 5.2.0-alpha.1

### Patch Changes

- phecda-web@3.0.2-alpha.1

## 5.2.0-alpha.0

### Minor Changes

- 03b1bf3: add `KeepAlive` decorator support unmount model in `useV/useR`
  useEvent should off event in `unMounted`

### Patch Changes

- phecda-web@3.0.2-alpha.0

## 5.1.2

### Patch Changes

- Updated dependencies [bffb0a0]
- Updated dependencies [d382585]
  - phecda-web@3.0.1

## 5.1.1

### Patch Changes

- 12f3d32: lib mode support
  1. Init/Unmount
  2. params inject
  3. Reuse within the same component
  4. force provide a new module

## 5.1.0

### Minor Changes

- d5ed1d5: support lib mode (experiment)

## 5.0.0

### Major Changes

- 831c910: release core v4

  1. refactor how meta is set and get
  2. refactor Phecda target structure
  3. remove some useless decorators

### Patch Changes

- Updated dependencies [831c910]
  - phecda-web@3.0.0

## 4.0.8

### Patch Changes

- Updated dependencies [9a6341e]
  - phecda-web@2.0.8

## 4.0.7

### Patch Changes

- phecda-web@2.0.7

## 4.0.6

### Patch Changes

- phecda-web@2.0.6

## 4.0.5

### Patch Changes

- f9578f7: add getRaw
- f9578f7: add param `models` to `createPhecda`
- Updated dependencies [a55a92f]
- Updated dependencies [f9578f7]
  - phecda-web@2.0.5

## 4.0.4

### Patch Changes

- 44d82c3: revert decorator `Shallow` because of `If`
  - phecda-web@2.0.4

## 4.0.3

### Patch Changes

- 8f2fe66: support vue devtools
- 8f2fe66: add namespace to support phecda-vue/phecda-react work in the same app

  namespace should be a Map

- Updated dependencies [8f2fe66]
- Updated dependencies [8f2fe66]
  - phecda-web@2.0.3

## 4.0.2

### Patch Changes

- b7ab24b: Functions starting with "use" must and can only be used inside the component.

  add `getR/getPhecda/getV` to work outside component

- 34513a7: add vue app to VuePhecda
- 34513a7: add defaultPhecda to support pure browser environment (not in ssr/nodejs)
- Updated dependencies [34513a7]
  - phecda-web@2.0.2

## 4.0.1

### Patch Changes

- 37148d6: update sth to support phecda-react

  refactor `Shallow` in `phecda-vue`

- Updated dependencies [37148d6]
  - phecda-web@2.0.1

## 4.0.0

### Major Changes

- remove filter in `phecda-vue`

  refactor `useV` in `phecda-vue`, cache is managed by `useV` itself, not Phecda instance

  using `reflect-metadata` and `Proxy`

  refactor to ensure `vue/react/web` structor is similar to `phecda-server`

  only keep simple hook like `useR`

  Add `usePhecda` hook for advanced operations

  Follow the provide/inject (vue) and context(react) pattern to support `ssr`

  `init` handler won't exec in ssr

### Patch Changes

- Updated dependencies
  - phecda-web@2.0.0

## 3.0.0

### Major Changes

- 0d6d8ad: refactor activeInstance logic to support ssr

### Minor Changes

- cf59f17: split part to web

### Patch Changes

- 5bc160a: add markRaw just for types
- 120716e: refactor: remove all map;use cache/origin/state instead
- 743709f: add WatchEffect
- 6a55ac9: won't load module with tag that has been loaded before
- 65cc59a: add waitUntilInit
- fb6633c: add Isolate
- 09addb4: get function in useV should bind correct target
- 074a815: model=class and module=instance
- 43cc4e9: add Shallow to support shallowReactive
- 048b9ee: remove all components
- 9c83eae: add warn when using the same tag module
- Updated dependencies [120716e]
- Updated dependencies [e254263]
- Updated dependencies [43cc4e9]
- Updated dependencies [b041748]
- Updated dependencies [074a815]
- Updated dependencies [9c83eae]
  - phecda-web@1.0.1

## 3.0.0-beta.22

### Patch Changes

- phecda-web@1.0.1-beta.14

## 3.0.0-beta.21

### Patch Changes

- 743709f: add WatchEffect

## 3.0.0-beta.20

### Patch Changes

- Updated dependencies [b041748]
  - phecda-web@1.0.1-beta.13

## 3.0.0-beta.19

### Patch Changes

- phecda-web@1.0.1-beta.12

## 3.0.0-beta.18

### Patch Changes

- 074a815: model=class and module=instance
- Updated dependencies [074a815]
  - phecda-web@1.0.1-beta.11

## 3.0.0-beta.17

### Patch Changes

- 09addb4: get function in useV should bind correct target

## 3.0.0-beta.16

### Patch Changes

- phecda-web@1.0.1-beta.10

## 3.0.0-alpha.15

### Patch Changes

- phecda-web@1.0.1-alpha.9

## 3.0.0-alpha.14

### Patch Changes

- phecda-web@1.0.1-alpha.8

## 3.0.0-alpha.13

### Patch Changes

- 5bc160a: add markRaw just for types
- 120716e: refactor: remove all map;use cache/origin/state instead
- 43cc4e9: add Shallow to support shallowReactive
- Updated dependencies [120716e]
- Updated dependencies [e254263]
- Updated dependencies [43cc4e9]
  - phecda-web@1.0.1-alpha.7

## 3.0.0-alpha.12

### Patch Changes

- phecda-web@1.0.1-alpha.6

## 3.0.0-alpha.11

### Patch Changes

- phecda-web@1.0.1-alpha.5

## 3.0.0-alpha.10

### Patch Changes

- 9c83eae: add warn when using the same tag module
- Updated dependencies [9c83eae]
  - phecda-web@1.0.1-alpha.4

## 3.0.0-alpha.9

### Patch Changes

- phecda-web@1.0.1-alpha.3

## 3.0.0-alpha.8

### Patch Changes

- phecda-web@1.0.1-alpha.2

## 3.0.0-alpha.7

### Patch Changes

- phecda-web@1.0.1-alpha.1

## 3.0.0-alpha.6

### Major Changes

- 0d6d8ad: refactor activeInstance logic to support ssr

### Minor Changes

- cf59f17: split part to web

### Patch Changes

- phecda-web@1.0.1-alpha.0

## 2.1.3-alpha.5

### Patch Changes

- fb6633c: add Isolate

## 2.1.3-alpha.4

### Patch Changes

- 65cc59a: add waitUntilInit
- Updated dependencies [c40fece]
  - phecda-core@3.0.0-alpha.2

## 2.1.3-alpha.3

### Patch Changes

- 6a55ac9: won't load module with tag that has been loaded before

## 2.1.3-alpha.2

### Patch Changes

- Updated dependencies [fc8db58]
  - phecda-core@3.0.0-alpha.1

## 2.1.3-alpha.1

### Patch Changes

- Updated dependencies [8f35d74]
  - phecda-core@2.1.2-alpha.0

## 2.1.3-alpha.0

### Patch Changes

- 048b9ee: remove all components

## 2.1.2

### Patch Changes

- 0d19e23: fix initlize

## 2.1.1

### Patch Changes

- Updated dependencies [99b458d]
  - phecda-core@2.1.1

## 2.1.0

### Minor Changes

- 222465a: not responsible for table/form/other component-lib any more

### Patch Changes

- Updated dependencies [4c4c45a]
- Updated dependencies [ec66a44]
- Updated dependencies [de7cf57]
- Updated dependencies [de7cf57]
- Updated dependencies [1dd0831]
  - phecda-core@2.1.0

## 2.0.4-alpha.2

### Patch Changes

- Updated dependencies [ec66a44]
  - phecda-core@2.1.0-alpha.2

## 2.0.4-alpha.1

### Patch Changes

- Updated dependencies [4c4c45a]
- Updated dependencies [de7cf57]
- Updated dependencies [de7cf57]
  - phecda-core@2.1.0-alpha.1

## 2.0.4-alpha.0

### Patch Changes

- Updated dependencies [1dd0831]
  - phecda-core@2.0.1-alpha.0

## 2.0.3

### Patch Changes

- 9c73b4d: hard to use createModal sometimes, so add createDialog instead
- 9c73b4d: props that bind slot tag in modal wrap will inject to the content

## 2.0.2

### Patch Changes

- 1d58f4e: add appContext to createModal/createLayer,to support provide/inject(must with createPhecda)

## 2.0.1

### Patch Changes

- 9615af4: rewrite createFilter

## 2.0.0

### Major Changes

- 78cb57a: refactor namespace structor to avoid namespace population

### Patch Changes

- e23c5fb: errorHandler work even in setter
- ebae9ea: filter return reactive will cause perf in some cases
- c507f78: createTable support custom render(with props) and column group (only test arco and element-plus)
- c507f78: add useRaw
- bf8d83a: replace computed with toRef
- Updated dependencies [d6d2146]
- Updated dependencies [049c138]
- Updated dependencies [78cb57a]
- Updated dependencies [a701f34]
- Updated dependencies [25cf638]
- Updated dependencies [eec80a6]
- Updated dependencies [64c2f70]
- Updated dependencies [8fe5ced]
  - phecda-core@2.0.0

## 2.0.0-alpha.9

### Patch Changes

- Updated dependencies [a701f34]
  - phecda-core@2.0.0-alpha.7

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
