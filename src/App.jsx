

import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "./redux/slices/userAuthSlice";
import Loader from "./components/common/Loader"; // 👈 loader import
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";

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
    window.scrollTo(0, 0);
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
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;