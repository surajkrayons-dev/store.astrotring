import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../baseApi';

// ---------- THUNKS ----------
export const fetchCart = createAsyncThunk(
  'cartApi/fetchCart',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Token check - agar login nahi hai to error throw karo
      const { userAuth } = getState();
      if (!userAuth.isLoggedIn) {
        return rejectWithValue('Please login to view cart');
      }
      
      const response = await api.get('/user/cart');
      return response.data.data; // मान लिया कि data array में है
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCartApi = createAsyncThunk(
  'cartApi/addToCart',
  async ({ product_id, quantity = 1 }, { rejectWithValue, getState }) => {
    try {
      const { userAuth } = getState();
      if (!userAuth.isLoggedIn) {
        return rejectWithValue('Please login to add items to cart');
      }
      
      const response = await api.post('/user/cart/add', { product_id, quantity });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cartApi/updateCartItem',
  async ({ cart_id, quantity }, { rejectWithValue, getState }) => {
    try {
      const { userAuth } = getState();
      if (!userAuth.isLoggedIn) {
        return rejectWithValue('Please login to update cart');
      }
      
      const response = await api.post('/user/cart/update', { cart_id, quantity });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

export const removeFromCartApi = createAsyncThunk(
  'cartApi/removeFromCart',
  async (cart_id, { rejectWithValue, getState }) => {
    try {
      const { userAuth } = getState();
      if (!userAuth.isLoggedIn) {
        return rejectWithValue('Please login to remove items');
      }
      
      const response = await api.delete(`/user/cart/remove/${cart_id}`);
      return { cart_id, data: response.data }; // success पर cart_id return करो
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

// ---------- INITIAL STATE ----------
const initialState = {
  items: [],        // server से आए cart items
  loading: false,
  error: null,
  syncStatus: 'idle', // 'idle' | 'syncing' | 'synced' | 'error'
};

// ---------- SLICE ----------
const cartApiSlice = createSlice({
  name: 'cartApi',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    resetCartApi: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add to Cart
      .addCase(addToCartApi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartApi.fulfilled, (state, action) => {
        state.loading = false;
        // मान लिया कि API पूरा cart return करती है
        state.items = action.payload; 
      })
      .addCase(addToCartApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Cart
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload; // पूरा updated cart
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove from Cart
      .addCase(removeFromCartApi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartApi.fulfilled, (state, action) => {
        state.loading = false;
        // local state से item हटाओ
        state.items = state.items.filter(item => item.id !== action.payload.cart_id);
      })
      .addCase(removeFromCartApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCartError, resetCartApi } = cartApiSlice.actions;
export default cartApiSlice.reducer;