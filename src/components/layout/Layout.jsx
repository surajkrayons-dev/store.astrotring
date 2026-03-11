// components/layout/Layout.jsx (या App.jsx)
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import UserLogin from "../auth/UserLogin"; // 👈 import

const Layout = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="container mx-auto px-4">
        <Outlet />
      </main>
      <Footer />
      <UserLogin /> {/* 👈 yahan render karo – hamesha available rahega */}
    </div>
  );
};

export default Layout;