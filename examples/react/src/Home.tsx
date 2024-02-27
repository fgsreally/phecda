import {  useR } from "phecda-react";
import { HomeModel } from "./models/home";


export function Home() {
  return (
    <>
        <Child1></Child1>
        <Child2></Child2>
    </>
  );
}

export function Child1() {
  const [snap] = useR(HomeModel);
  return <>{snap.fullName}</>;
}

export function Child2() {
  const [snap, state] = useR(HomeModel);


  return (
    <>
      <button onClick={() => state.changeName(Math.random().toString())}>
        changeName:{snap.name}
      </button>
    </>
  );
}
