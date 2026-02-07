import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from '../services/payment.service';

export const receivePayment = createAsyncThunk(
  'payment/receivePayment',
  async (payload, thunkAPI) => {
    try {
      return await paymentService.receivePayment(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const getPatientLedgerById = createAsyncThunk(
  'payment/getPatientLedgerById',
  async (
    { id, page = 1, limit = 10, startDate = null, endDate = null, caseType = null },
    thunkAPI
  ) => {
    try {
      console.log('Fetching ledger for:', id);
      const data = await paymentService.getPatientLedgerById({
        id,
        page,
        limit,
        startDate,
        endDate,
        caseType,
      });
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const getPatientPaymentHistory = createAsyncThunk(
  'payment/getPatientPaymentHistory',
  async (patientId, thunkAPI) => {
    try {
      return await paymentService.getPatientPaymentHistory(patientId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error.message);
    }
  }
);
export const getPatientLedger = createAsyncThunk(
  'payment/getPatientLedger',
  async (
    {
      page = 1,
      limit = 10,
      ordering = '-receivedAt',
      startDate = null,
      endDate = null,
      search = null,
      id = null,
      caseType = null,
    },
    thunkAPI
  ) => {
    try {
      const data = await paymentService.getPatientLedger({
        page,
        limit,
        ordering,
        startDate,
        endDate,
        search,
        id,
        caseType,
      });
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error.message);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    loading: false,
    error: null,
    receiveResult: null,
    paymentHistory: [],
    ledger: null,
  },
  reducers: {
    clearPaymentState: (state) => {
      state.loading = false;
      state.error = null;
      state.receiveResult = null;
    },
    clearPaymentHistory: (state) => {
      state.paymentHistory = [];
    },
    clearLedger: (state) => {
      state.ledger = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPatientLedgerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPatientLedgerById.fulfilled, (state, action) => {
        state.loading = false;
        state.ledger = action.payload;
      })
      .addCase(getPatientLedgerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(receivePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(receivePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.receiveResult = action.payload;
      })
      .addCase(receivePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 GET PAYMENT HISTORY
      .addCase(getPatientPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPatientPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = action.payload;
      })
      .addCase(getPatientPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getPatientLedger.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPatientLedger.fulfilled, (state, action) => {
        state.loading = false;
        state.ledger = action.payload;
      })
      .addCase(getPatientLedger.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentState, clearPaymentHistory, clearLedger } = paymentSlice.actions;

export default paymentSlice.reducer;
