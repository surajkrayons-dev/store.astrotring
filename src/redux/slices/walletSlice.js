// src/redux/slices/walletSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../baseApi';

// Fetch wallet balance
export const fetchWallet = createAsyncThunk(
  'wallet/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/wallet'); // backend will provide this endpoint

      console.log("fetch wallet",response.data)
      return response.data; // expects { balance: number } or { data: { balance } }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet');
    }
  }
);

// Create order for adding money
export const createOrder = createAsyncThunk(
  'wallet/createOrder',
  async (amount, { rejectWithValue }) => {
    try {
      const response = await api.post('/wallet/topup/create-order', { amount });

            console.log("add money to wallet",response.data)

      return response.data; // expects { order_id, amount, currency }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

// Verify payment after successful transaction
export const verifyPayment = createAsyncThunk(
  'wallet/verifyPayment',
  async ({ paymentData, amount }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/wallet/topup/verify', {
        ...paymentData,
        amount,
      });
      // After verification, refresh wallet balance
      await dispatch(fetchWallet());

              console.log("verify wallet",response.data)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    balance: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchWallet
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.loading = false;
        // adjust based on actual response structure
        state.balance = action.payload.balance ?? action.payload.data?.balance ?? 0;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createOrder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // verifyPayment
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state) => {
        state.loading = false;
        // balance is updated via fetchWallet called inside the thunk
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWalletError } = walletSlice.actions;
export default walletSlice.reducer;