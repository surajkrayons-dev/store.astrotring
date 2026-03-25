
import { createSlice } from '@reduxjs/toolkit';

// Load from localStorage
const loadWishlist = () => {
  try {
    const stored = localStorage.getItem('wishlist');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load wishlist', error);
    return [];
  }
};

// Save to localStorage
const saveWishlist = (items) => {
  localStorage.setItem('wishlist', JSON.stringify(items));
};

const initialState = {
  items: loadWishlist(),
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const product = action.payload;
      const exists = state.items.some(item => item.id === product.id);
      if (!exists) {
        state.items.push(product);
        saveWishlist(state.items);
      }
    },
    removeFromWishlist: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);
      saveWishlist(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      saveWishlist([]);
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;