import { usePhecda, useR } from "phecda-react";
import { AboutModel } from "../models/about";
import { Link } from "react-router-dom";
import { UserModel } from "../models/user";
export const About = () => {
  const { init } = usePhecda();
  const [{ createdAt }, { changeUserName, emit_update }] = useR(AboutModel);
  const user = init(UserModel);
  const about = init(AboutModel);
  about.user = user;
  return (
    <div className="about">
      <Link to="/"> to Home</Link>

      <h1>This is an about page</h1>
      <section>
        <p>
          {createdAt.hour} : {createdAt.minute}:{createdAt.second}
        </p>
      </section>
      <button onClick={() => changeUserName("jane")}>
        change user name to Jane
      </button>
      <button onClick={emit_update}>emit update event</button>
    </div>
  );
};
