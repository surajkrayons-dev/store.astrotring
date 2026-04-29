

import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "./redux/slices/userAuthSlice";
import Loader from "./components/common/Loader";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import ProfilePage from "./pages/ProfilePage";

import AddressesPage from "./pages/AddressesPage";

import CheckoutPage from "./pages/CheckoutPage";
import MyOrderDetailsPage from "./pages/MyOrderDetailsPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import WalletPage from "./pages/WalletPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import WishlistPage from "./pages/WishlistPage";
import Gemstonesinfo from "./pages/product info/GemstonesInfo";
import GemstoneDetails from "./pages/product info/GemstoneDetails";
import TrackMyOrderPage from "./pages/TrackMyOrderPage";
import ComingSoon from "./components/common/ComingSoon";

// Lazy load all pages

const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const DisclaimerPage = lazy(() => import("./pages/legal/DisclaimerPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/legal/PrivacyPolicyPage"));
const RefundPolicyPage = lazy(() => import("./pages/legal/RefundPolicyPage"));
const ShippingPolicyPage = lazy(() => import("./pages/legal/ShippingPolicyPage"));
const TermsAndConditionsPage = lazy(() => import("./pages/legal/TermsAndConditionsPage"));

function App() {
  const path = useLocation().pathname;
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.userAuth);

  useEffect(() => {
    if (token && !user) {
      dispatch(userProfile());
    }
  }, [token, user, dispatch]);


  useEffect(() => {

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [path]);
  return (
    <Suspense fallback={<Loader data="Loading..." />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="product/:id" element={<ProductDetailsPage />} />
          <Route path="cart" element={<CartPage />} />

          {/* Policies and T&C */}
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="/terms-conditions" element={<TermsAndConditionsPage />} />
          {/* product catogaries page */}
          <Route path="/category/:slug" element={<CategoryPage />} />


          {/* product info */}

          <Route path="/gemstones" element={<Gemstonesinfo />} />
          {/* <Route path="/gemstones/:name" element={<GemstoneDetails />} /> */}
          <Route path="/gemstones/:name/:id" element={<GemstoneDetails />} />


          {/* comming soon route */}
          <Route path="/coming-soon" element={<ComingSoon />} />

        </Route>

        {/* ====================================================================================== */}

        {/* user details */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* checkout  */}
        <Route path="checkout" element={<CheckoutPage />} />
        {/* ordersuccess */}
        <Route path="order-success" element={<OrderSuccessPage />} />
        {/* my order page */}
        <Route path="/orders" element={<MyOrdersPage />} />
        {/* order details page */}
        <Route path="/orders/:id" element={<MyOrderDetailsPage />} />
        {/* track my order page */}
        <Route path="/track-order/:orderId?" element={<TrackMyOrderPage />} />
        <Route path="/track-order/" element={<TrackMyOrderPage />} />
        {/* user wallet */}
        <Route path="/wallet" element={<WalletPage />} />
        {/* wishlist */}
        <Route path="/wishlist" element={<WishlistPage />} />
        {/* address */}
        <Route path="addresses" element={<AddressesPage />} />





      </Routes>

    </Suspense>
  );
}

export default App;