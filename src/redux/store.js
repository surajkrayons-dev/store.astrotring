import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import userAuthReducer from "./slices/userAuthSlice";
import bannerReducer from "./slices/bannerSlice";
import productReducer from "./slices/productSlice";
import orderReducer from './slices/orderSlice';
import cartApiReducer from './slices/cartApiSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    userAuth: userAuthReducer,
    banner: bannerReducer,
    product: productReducer,
    cartApi: cartApiReducer,
    order: orderReducer,
  },
});
