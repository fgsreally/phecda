import { usePhecda, useR } from "phecda-react";
import { UserModel } from "../models/user";
import { Link } from "react-router-dom";

export function Home() {
  const [userGetter, userSetter] = useR(UserModel);
  const { reset, patch } = usePhecda();

  return (
    <>
      <main>
        <Link to="about">to about</Link>
        <button onClick={() => reset(UserModel)}>initlize</button>

        <section>
          <p>
            {userGetter.createdAt.hour} : {userGetter.createdAt.minute}:
            {userGetter.createdAt.second}
          </p>
          <div>name:{userGetter.name}</div>
          <div>fullName:{userGetter.fullName}</div>
          <div> obj.id:{userGetter.obj.id}</div>
        </section>

        <button
          onClick={() =>
            patch(UserModel, { obj: { id: Math.floor(Math.random() * 100) } })
          }
        >
          patch user id
        </button>
        <button onClick={() => userSetter.changeName("Tom")}>
          change home name to Tom
        </button>
      </main>
    </>
  );
}
