import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Footer from "../components/sharedComponents/Footer";
import Navbar from "../components/sharedComponents/Navbar";


const Root = () => {
  const location = useLocation();

  // Prevent browser from restoring previous scroll and always start at top on load/refresh
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    // Initial mount scroll to top
    window.scrollTo(0, 0);
  }, []);

  // Scroll to top on route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
    <Navbar />
    <Outlet />
    <Footer />
    </>
  );
};

export default Root;