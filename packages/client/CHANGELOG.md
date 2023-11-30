# phecda-client

## 1.2.3-alpha.0

### Patch Changes

- cdbd666: support @Head to input request header

## 1.2.2

### Patch Changes

- a217f88: remove null and undefined in request

## 1.2.1

### Patch Changes

- 02850c2: delete batchStack after chainReq promise finish( or it will cause puzzling problem)

## 1.2.0

### Minor Changes

- c507f78: add createChainRequest
- 6033ec7: chain req support batch

### Patch Changes

- d6d2146: only createReq when batch is false

## 1.2.0-alpha.1

### Patch Changes

- d6d2146: only createReq when batch is false

## 1.2.0-alpha.0

### Minor Changes

- c507f78: add createChainRequest
- 6033ec7: chain req support batch

## 1.1.6

### Patch Changes

- b8caae4: AsyncReturnToJson may cause types infinite , remove it from useC

## 1.1.5

### Patch Changes

- 48e0f9b: improve useC type, to make sure the response won't include function/symbol

## 1.1.4

### Patch Changes

- 6f87795: support empty key, all parameters in controller must have decorator

## 1.1.3

### Patch Changes

- c412cc9: fix toAsync type

## 1.1.2

### Patch Changes

- 34e74ab: fix emitFile in vite

## 1.1.1

### Patch Changes

- 0ad3128: fix vite plugin type and support .route

## 1.1.0

### Minor Changes

- 40e7ec2: add interval and port options to support poll

## 1.0.2

### Patch Changes

- b6c5853: vite devserver can't work when client import server

## 1.0.1

### Patch Changes

- 2a2665a: add toAsync
