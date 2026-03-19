import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../baseApi';

// ---------- THUNKS ----------
export const fetchAllProducts = createAsyncThunk(
  'product/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/products');
      console.log("all products",res.data.data)
      return res.data.data; // array of products

    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'product/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/products?product_id=${id}`);
      // API ka structure check karo – agar data array mein aa raha hai to pehla element lo
      const product = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
      console.log("object",product)
      return product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

// ---------- INITIAL STATE ----------
const initialState = {
  items: [],           // all products
  selectedProduct: null, // single product for details page
  loading: false,
  error: null,
  filters: {
    category: '',
    minPrice: '',
    maxPrice: '',
    // aur filters jo bhi ho
  }
};

// ---------- SLICE ----------
const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    // Local filters ke liye (agar UI state alag rakhna ho to)
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---------- FETCH ALL PRODUCTS ----------
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ---------- FETCH SINGLE PRODUCT ----------
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ---------- ACTIONS & REDUCER ----------
export const { setFilters, clearFilters, clearSelectedProduct, clearError } = productSlice.actions;
export default productSlice.reducer;

