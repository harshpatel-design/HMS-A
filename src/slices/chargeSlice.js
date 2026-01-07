import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chargeService from '../services/charge.service';

export const fetchCharges = createAsyncThunk(
  'charge/fetchCharges',
  async (
    {
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      order = 'DESC',
      search,
      startDate,
      endDate,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await chargeService.getCharges({
        page,
        limit,
        orderBy,
        order,
        search,
        startDate,
        endDate,
      });

      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load charges');
    }
  }
);

export const fetchChargeById = createAsyncThunk(
  'charge/fetchChargeById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await chargeService.getChargeById(id);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Charge not found');
    }
  }
);

export const createCharge = createAsyncThunk(
  'charge/createCharge',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await chargeService.createCharge(payload);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Only admin can create charge');
    }
  }
);

export const updateCharge = createAsyncThunk(
  'charge/updateCharge',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await chargeService.updateCharge(id, payload);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Update failed');
    }
  }
);


const initialState = {
  charges: [],
  charge: null,

  total: 0,
  totalPages: 1,
  page: 1,
  limit: 10,

  orderBy: 'createdAt',
  order: 'DESC',
  search: '',

  loading: false,
  error: null,
  success: false,
};

const chargeSlice = createSlice({
  name: 'charge',
  initialState,
  reducers: {
    resetChargeState: (state) => {
      state.success = false;
      state.error = null;
    },

    setSort: (state, action) => {
      state.orderBy = action.payload.orderBy;
      state.order = action.payload.order;
    },

    resetSort: (state) => {
      state.orderBy = 'createdAt';
      state.order = 'DESC';
    },
  },

  extraReducers: (builder) => {
    builder

      // 🔹 Fetch Charges
      .addCase(fetchCharges.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchCharges.fulfilled, (state, action) => {
        state.loading = false;

        state.charges = action.payload.charges || [];
        state.total = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 1;

        state.page = action.meta.arg.page;
        state.limit = action.meta.arg.limit;
      })

      .addCase(fetchCharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Fetch Charge By ID
      .addCase(fetchChargeById.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchChargeById.fulfilled, (state, action) => {
        state.loading = false;
        state.charge = action.payload;
      })

      .addCase(fetchChargeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Create Charge
      .addCase(createCharge.fulfilled, (state, action) => {
        state.success = true;
        state.charges.unshift(action.payload.data || action.payload);
      })

      .addCase(createCharge.rejected, (state, action) => {
        state.error = action.payload;
      })

      // 🔹 Update Charge
      .addCase(updateCharge.fulfilled, (state, action) => {
        state.success = true;

        const index = state.charges.findIndex((c) => c._id === action.payload._id);

        if (index !== -1) {
          state.charges[index] = action.payload;
        }
      })

      .addCase(updateCharge.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setSort, resetSort, resetChargeState } = chargeSlice.actions;

export default chargeSlice.reducer;
