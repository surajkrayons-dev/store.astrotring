import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../baseApi';

// Fetch wallet info
export const fetchWallet = createAsyncThunk(
  'wallet/fetchWallet',
  async (_, { rejectWithValue, getState }) => {
    const { userAuth } = getState();
    if (!userAuth.isLoggedIn) {
      return rejectWithValue('Please login to view wallet');
    }
    try {
      const response = await api.get('/store-wallet');
      return response.data.data; // { balance: number }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet');
    }
  }
);

// Add money to wallet
export const addMoneyToWallet = createAsyncThunk(
  'wallet/addMoney',
  async (amount, { rejectWithValue, getState }) => {
    const { userAuth } = getState();
    if (!userAuth.isLoggedIn) {
      return rejectWithValue('Please login to add money');
    }
    try {
      const response = await api.post('/store-wallet/add', { amount });
      return response.data.data; // updated wallet balance
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add money');
    }
  }
);

// Spend money from wallet (for order)
export const spendFromWallet = createAsyncThunk(
  'wallet/spend',
  async (amount, { rejectWithValue, getState }) => {
    const { userAuth } = getState();
    if (!userAuth.isLoggedIn) {
      return rejectWithValue('Please login to spend');
    }
    try {
      const response = await api.post('/store-wallet/spend', { amount });
      return response.data.data; // updated wallet balance
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to spend from wallet');
    }
  }
);

const initialState = {
  balance: 0,
  loading: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance || 0;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addMoneyToWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMoneyToWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance || 0;
      })
      .addCase(addMoneyToWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(spendFromWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(spendFromWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance || 0;
      })
      .addCase(spendFromWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWalletError } = walletSlice.actions;
export default walletSlice.reducer;