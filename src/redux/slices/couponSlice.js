import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../baseApi';

// Fetch all active coupons
export const fetchCoupons = createAsyncThunk(
  'coupon/fetchCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/coupons');
      return response.data.data; // array of coupons
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch coupons');
    }
  }
);

// Validate a single coupon by code
export const validateCoupon = createAsyncThunk(
  'coupon/validate',
  async (code, { rejectWithValue }) => {
    try {
      const response = await api.get(`/coupons?code=${code}`);
      return response.data.data; // returns the coupon object if valid
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid coupon');
    }
  }
);

const couponSlice = createSlice({
  name: 'coupon',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default couponSlice.reducer;