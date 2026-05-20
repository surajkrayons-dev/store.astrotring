// components/layout/Layout.jsx 
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import UserLogin from "../auth/UserLogin"; 
import TopPromoSlider from "../common/TopPromoSlider";
import WhatsAppButton from "../common/WhatsAppButton";
import CartDrawer from "../cart/CartDrawer";
import CheckoutPopupWrapper from "../checkout/CheckoutPopupWrapper";

const Layout = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <TopPromoSlider /> 
      <Navbar />
      <main className="container mx-auto">
        <Outlet />
      </main>
      <Footer />
      <UserLogin />
      <CartDrawer />
      <CheckoutPopupWrapper /> 
      <WhatsAppButton />
    </div>
  );
};

export default Layout;