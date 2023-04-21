export function MQ() {
  return (target: any, k: PropertyKey, index: number) => {
    setModalVar(target, key)
    mergeState(target, key, {
      guards: [guardKey],
    })
  }
}
