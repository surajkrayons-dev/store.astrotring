import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../baseApi';

// ---------- THUNKS ----------
export const initiatePayment = createAsyncThunk(
  'payment/initiate',
  async ({ order_id, method = 'online' }, { rejectWithValue }) => {
    console.log("initiate payment order_id ",order_id)     
      console.log("initiate payment method ",method) 
    try {
      const response = await api.post('/user/payment/initiate', { order_id, method });

          
      
      return response.data.data; // expects { key_id, amount, currency, razorpay_order_id, ... }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initiate payment');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payment/verify',
  async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/payment/verify', {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      console.log("razopar-pay verification",response.data)
      return response.data; // expects { success: true, ... }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
    }
  }
);

// ---------- INITIAL STATE ----------
const initialState = {
  loading: false,
  error: null,
};

// ---------- SLICE ----------
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;