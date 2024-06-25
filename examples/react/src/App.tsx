
import "./App.css";
import { About } from "./views/About";
import { Home } from "./views/Home";
import { PhecdaContext, createPhecda, usePhecda } from "phecda-react";
import {
  createBrowserRouter,
  RouterProvider,

  Link,
} from "react-router-dom";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home></Home>,
  },
  {
    path: "about",
    element: <About></About>
  },
]);

function App() {
  return (
    <>
      <PhecdaContext.Provider value={createPhecda()}>
        {/* <Link to="about">About Us</Link> */}

        <RouterProvider router={router}></RouterProvider>
      </PhecdaContext.Provider>
    </>
  );
}

export default App;
