import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HeroBanner from "../features/HeroBanner";

const Layout = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
       
      <main className="container mx-auto px-4">
        <HeroBanner />
      </main>
      <main className="container mx-auto px-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;