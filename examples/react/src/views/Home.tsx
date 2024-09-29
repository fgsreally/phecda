import { usePhecda, useR ,getR} from "phecda-react";
import { UserModel } from "../models/user";
import { Link } from "react-router-dom";

export function Home() {
  const [userGetter] = useR(UserModel);
  const { reset, patch } = usePhecda();

  function changeName(name: string) {
    getR(UserModel).changeName(name);
  }

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
        <button onClick={() => changeName("Tom")}>
          change home name to Tom
        </button>
      </main>
    </>
  );
}
