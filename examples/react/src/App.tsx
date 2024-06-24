
import "./App.css";
import { Home } from "./views/Home";
import { PhecdaContext, createPhecda, usePhecda } from "phecda-react";

import {
  createBrowserRouter,
  RouterProvider,

  Link,
} from "react-router-dom";
import { UserModel } from "./models/user";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home></Home>,
  },
  // {
  //   path: "about",
  //   element: <About></About>
  // },
]);

function App() {
  const { reset } = usePhecda();
  return (
    <>
      <PhecdaContext.Provider value={createPhecda()}>
        <button onClick={()=>reset(UserModel)}>initlize</button>
        {/* <Link to="about">About Us</Link> */}

        <RouterProvider router={router}></RouterProvider>
      </PhecdaContext.Provider>
    </>
  );
}

export default App;
