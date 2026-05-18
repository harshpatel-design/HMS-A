import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getDashBoardCount as getDashBoardCountService } from '../services/dashBoardCount';

export const getDashBoardCount = createAsyncThunk(
  'count/getDashBoardCount',

  async ({ startDate, endDate } = {}, thunkAPI) => {
    try {
      const response = await getDashBoardCountService({
        startDate,
        endDate,
      });
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error.message);
    }
  }
);

const initialState = {
  counts: null,
  loading: false,
  error: null,
};

const countSlice = createSlice({
  name: 'count',

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(getDashBoardCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashBoardCount.fulfilled, (state, action) => {
        state.loading = false;
        state.counts = action.payload;
      })
      .addCase(getDashBoardCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      });
  },
});

export default countSlice.reducer;
