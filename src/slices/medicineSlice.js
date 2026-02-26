import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import medicineService from '../services/medicineService';

export const fetchMedicines = createAsyncThunk(
  'medicine/fetchMedicines',
  async (
    { page = 1, limit = 10, search = '', sortBy = 'createdAt', order = 'DESC' , form = '' },
    { rejectWithValue }
  ) => {
    try {
      const res = await medicineService.getMedicines({ page, limit, search, sortBy, order , form });
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchMedicineById = createAsyncThunk(
  'medicine/fetchMedicineById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await medicineService.getMedicineById(id);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createMedicine = createAsyncThunk(
  'medicine/createMedicine',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await medicineService.createMedicine(payload);
      if (res?.success === false) return rejectWithValue(res);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateMedicine = createAsyncThunk(
  'medicine/updateMedicine',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await medicineService.updateMedicine(id, data);
      if (res?.success === false) return rejectWithValue(res);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteMedicine = createAsyncThunk(
  'medicine/deleteMedicine',
  async (id, { rejectWithValue }) => {
    try {
      const res = await medicineService.deleteMedicine(id);
      if (res?.success === false) return rejectWithValue(res);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  medicines: [],
  medicine: null,
  total: 0,
  totalPages: 1,
  page: 1,
  limit: 10,
  search: '',
  sortBy: 'createdAt',
  order: 'DESC',
  loading: false,
  error: null,
  success: false,
};

const medicineSlice = createSlice({
  name: 'medicine',
  initialState,
  reducers: {
    resetMedicineState: (state) => {
      state.medicines = [];
      state.medicine = null;
      state.error = null;
      state.success = false;
    },
    setSort: (state, action) => {
      state.sortBy = action.payload.sortBy;
      state.order = action.payload.order;
    },
    resetSort: (state) => {
      state.sortBy = 'createdAt';
      state.order = 'DESC';
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchMedicines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicines.fulfilled, (state, action) => {
        state.loading = false;
        state.medicines = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchMedicines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchMedicineById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicineById.fulfilled, (state, action) => {
        state.loading = false;
        state.medicine = action.payload;
      })
      .addCase(fetchMedicineById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createMedicine.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createMedicine.fulfilled, (state, action) => {
        state.loading = false;
        state.medicines.unshift(action.payload);
        state.success = true;
      })
      .addCase(createMedicine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMedicine.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateMedicine.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.medicines.findIndex((med) => med._id === action.payload._id);

        if (index !== -1) {
          state.medicines[index] = action.payload;
        }

        state.success = true;
      })
      .addCase(updateMedicine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteMedicine.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteMedicine.fulfilled, (state, action) => {
        state.loading = false;

        state.medicines = state.medicines.filter((med) => med._id !== action.payload._id);

        state.success = true;
      })
      .addCase(deleteMedicine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const { resetMedicineState, setSort, resetSort } = medicineSlice.actions;
export default medicineSlice.reducer;
