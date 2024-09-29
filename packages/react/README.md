# phecda-react

> it need a compile plugin to support `emitDecoratorMetadata` in `vite/webpack`

it depends on `valtio`

## quick

```tsx
export function Home() {
  const [getter, setter] = useR(UserModel)

  return (
    <>
      <div>{getter.name}</div>
      <button onClick={() => { setter.changeName() }}></button>
    </>
  )
}
```
