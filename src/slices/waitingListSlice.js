import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import waitingListService from '../services/waitingListService';

export const addToWaitingList = createAsyncThunk(
  'waitingList/add',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await waitingListService.addToWaitingList(payload);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add to waiting list');
    }
  }
);

export const deleteWaitingList = createAsyncThunk(
  'waitingList/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await waitingListService.deleteWaitingList(id);
      return { id, res };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete waiting list');
    }
  }
);

export const updateWaitingList = createAsyncThunk(
  'waitingList/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await waitingListService.updateWaitingList(id, data);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update waiting list');
    }
  }
);

export const fetchAllWaitingList = createAsyncThunk(
  'waitingList/fetchAll',
  async (
    { page = 1, limit = 10, type, search, sortBy, order, status = '' } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await waitingListService.getAllWaitingList({
        page,
        limit,
        type,
        search,
        sortBy,
        order,
        status,
      });
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load waiting list');
    }
  }
);

export const fetchDoctorWaitingList = createAsyncThunk(
  'waitingList/fetchDoctor',
  async (
    { doctorId, page = 1, limit = 10, type, startDate, endDate, search, sortBy, order },
    { rejectWithValue }
  ) => {
    try {
      const res = await waitingListService.getDoctorWaitingList({
        doctorId,
        page,
        limit,
        type,
        startDate,
        endDate,
        search,
        sortBy,
        order,
      });
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load doctor waiting list');
    }
  }
);

const initialState = {
  waitingList: [],
  doctorQueue: [],
  total: 0,
  totalPages: 1,
  page: 1,
  limit: 10,
  loading: false,
  error: null,
  success: false,
};

const waitingListSlice = createSlice({
  name: 'waitingList',
  initialState,
  reducers: {
    resetWaitingListState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToWaitingList.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToWaitingList.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.waitingList.unshift(action.payload.data || action.payload);
      })
      .addCase(addToWaitingList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteWaitingList.fulfilled, (state, action) => {
        state.success = true;
        state.waitingList = state.waitingList.filter((item) => item._id !== action.payload.id);
      })
      .addCase(deleteWaitingList.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateWaitingList.fulfilled, (state, action) => {
        state.success = true;
        const index = state.waitingList.findIndex((i) => i._id === action.payload._id);
        if (index !== -1) state.waitingList[index] = action.payload;
      })
      .addCase(updateWaitingList.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchAllWaitingList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllWaitingList.fulfilled, (state, action) => {
        state.loading = false;
        state.waitingList = action.payload.data || [];
        state.total = action.payload.pagination?.total || 0;
        state.totalPages = action.payload.pagination?.totalPages || 1;
        state.page = action.meta.arg.page;
        state.limit = action.meta.arg.limit;
      })
      .addCase(fetchAllWaitingList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDoctorWaitingList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDoctorWaitingList.fulfilled, (state, action) => {
        state.loading = false;
        state.doctorQueue = action.payload.data || [];
        state.total = action.payload.pagination?.total || 0;
        state.totalPages = action.payload.pagination?.totalPages || 1;
        state.page = action.meta.arg.page;
        state.limit = action.meta.arg.limit;
      })
      .addCase(fetchDoctorWaitingList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetWaitingListState } = waitingListSlice.actions;
export default waitingListSlice.reducer;
