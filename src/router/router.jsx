import { createBrowserRouter } from "react-router-dom";
import Root from "../layout/Root";
import Home from "../page/Home";
import Product from "../page/Product";
import Recharge from "../page/Recharge";
import Shops from "../page/Shops";
import About from "../page/About";
import Contact from "../page/Contact";
import Auth from "../page/Auth";
import Profile from "../page/Profile";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root></Root>,
    children: [
  { path: "/", element: <Home></Home> },
  { path: "/product", element: <Product /> },
  { path: "/recharge", element: <Recharge /> },
  { path: "/shops", element: <Shops /> },
  { path: "/about", element: <About /> },
  { path: "/contact", element: <Contact /> },
  { path: "/auth", element: <Auth /> },
  { path: "/profile", element: <Profile /> },
    ]
  }
]);

