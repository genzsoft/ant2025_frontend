import { Outlet } from "react-router-dom";
import Footer from "../components/sharedComponents/Footer";
import Navbar from "../components/sharedComponents/Navbar";


const Root = () => {
  return (
    <>
    <Navbar />
    <Outlet />
    <Footer />
    </>
  );
};

export default Root;