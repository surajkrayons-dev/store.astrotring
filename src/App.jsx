import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { userProfile } from "./redux/slices/userAuthSlice";

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.userAuth);

  useEffect(() => {
    // Agar token hai lekin user null hai to profile fetch karo
    if (token && !user) {
      dispatch(userProfile());
    }
  }, [token, user, dispatch]);
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="product/:id" element={<ProductDetailsPage />} />
        <Route path="cart" element={<CartPage />} />
      </Route>
    </Routes>
  );
}

export default App;