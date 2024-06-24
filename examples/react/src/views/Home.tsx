import { proxy, usePhecda, useSnapshot } from "phecda-react";
import { UserModel } from "../models/user";

const newUser = proxy(new UserModel());

export function Home() {
  const user = useSnapshot(newUser);
  const { patch } = usePhecda();
  return (
    <>
      <main>
        <section>
          <p>
            {user.createdAt.hour} : {user.createdAt.minute}:
            {user.createdAt.second}
          </p>
          <div>name:{user.name}</div>
          <div>fullName:{user.fullName}</div>
          <div> obj.id:{user.obj.id}</div>
        </section>

        <button
          onClick={() =>
            patch(UserModel, { obj: { id: Math.floor(Math.random() * 100) } })
          }
        >
          patch user id
        </button>
        <button onClick={() => user.changeName("Tom")}>
          change home name to Tom
        </button>
      </main>
    </>
  );
}
