import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../baseApi';

// ---------- THUNKS ----------
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue, getState }) => {
    const { userAuth } = getState();
    if (!userAuth.isLoggedIn) {
      return rejectWithValue('Please login to view cart');
    }
    try {
      const response = await api.get('/user/cart');
      // API returns { status: true, data: { items: [...], grand_total } }
      return response.data.data.items; // extract the items array
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ product_id, quantity = 1 }, { rejectWithValue, getState }) => {
    const { userAuth } = getState();
    if (!userAuth.isLoggedIn) {
      return rejectWithValue('Please login to add items to cart');
    }
    try {
      const response = await api.post('/user/cart/add', { product_id, quantity });
      // response is { status: true, message: 'Product added to cart' }
      // No cart data returned, so we just return success indicator
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ item_id, quantity }, { rejectWithValue, getState }) => {   // 👈 changed
    const { userAuth } = getState();
    if (!userAuth.isLoggedIn) {
      return rejectWithValue('Please login to update cart');
    }
    try {
      const response = await api.post('/user/cart/update', { item_id, quantity }); // 👈 changed
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (cart_id, { rejectWithValue, getState }) => {
    const { userAuth } = getState();
    if (!userAuth.isLoggedIn) {
      return rejectWithValue('Please login to remove items');
    }
    try {
      await api.delete(`/user/cart/remove/${cart_id}`);
      return { cart_id }; // return the id to remove from local state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

// ---------- INITIAL STATE ----------
const initialState = {
  items: [],        // array of cart items as returned by API (flat structure)
  loading: false,
  error: null,
  syncStatus: 'idle',
};

// ---------- SLICE ----------
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    resetCart: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload is the items array directly
        state.items = action.payload || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addToCart – no state update, just loading
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.loading = false;
        // Cart will be refetched by component after success
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateCartItem
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // removeFromCart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        // Remove item by cart_id (which matches the item's `item_id` in the items array)
        state.items = state.items.filter(item => item.item_id !== action.payload.cart_id);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCartError, resetCart } = cartSlice.actions;
export default cartSlice.reducer;