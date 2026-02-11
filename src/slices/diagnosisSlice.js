import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import diagnosisService from '../services/diagnosisService';

export const createDiagnosis = createAsyncThunk(
  'diagnosis/create',
  async (payload, thunkAPI) => {
    try {
      return await diagnosisService.createDiagnosis(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.message || error);
    }
  }
);

export const getAllDiagnosis = createAsyncThunk(
  'diagnosis/getAll',
  async (params, thunkAPI) => {
    try {
      return await diagnosisService.getAllDiagnosis(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.message || error);
    }
  }
);

export const getDiagnosisById = createAsyncThunk(
  'diagnosis/getById',
  async (id, thunkAPI) => {
    try {
      return await diagnosisService.getDiagnosisById(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.message || error);
    }
  }
);

export const updateDiagnosisById = createAsyncThunk(
  'diagnosis/update',
  async ({ id, payload }, thunkAPI) => {
    try {
      return await diagnosisService.updateDiagnosisById(id, payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.message || error);
    }
  }
);

const initialState = {
  list: [],
  total: 0,
  page: 1,
  limit: 10,
  selectedDiagnosis: null,
  loading: false,
  error: null,
  success: false,
};

const diagnosisSlice = createSlice({
  name: 'diagnosis',
  initialState,
  reducers: {
    clearDiagnosisState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearSelectedDiagnosis: (state) => {
      state.selectedDiagnosis = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDiagnosis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDiagnosis.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.list.unshift(action.payload?.data || action.payload);
      })
      .addCase(createDiagnosis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllDiagnosis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllDiagnosis.fulfilled, (state, action) => {
        state.loading = false;
        const res = action.payload;
        state.list = res?.data || [];
        state.total = res?.total || 0;
        state.page = res?.page || 1;
        state.limit = res?.limit || 10;
      })
      .addCase(getAllDiagnosis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getDiagnosisById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDiagnosisById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDiagnosis = action.payload?.data || action.payload;
      })
      .addCase(getDiagnosisById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDiagnosisById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDiagnosisById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const updated = action.payload?.data || action.payload;

        state.list = state.list.map((item) =>
          item._id === updated._id ? updated : item
        );

        if (state.selectedDiagnosis?._id === updated._id) {
          state.selectedDiagnosis = updated;
        }
      })
      .addCase(updateDiagnosisById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearDiagnosisState,
  clearSelectedDiagnosis,
} = diagnosisSlice.actions;

export default diagnosisSlice.reducer;
