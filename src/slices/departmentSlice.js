import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import getDepartments from "../services/departmentService";

export const fetchDepartments = createAsyncThunk(
  "department/fetchDepartments",
  async (params = {}, { rejectWithValue }) => {
    const res = await getDepartments(params);

    if (!res.success) {
      return rejectWithValue(res.message);
    }

    return res;
  }
);

const initialState = {
  departments: [],
  loading: false,
  error: null,
  count: 0,
};

const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    resetDepartmentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload.departments;
        state.count = action.payload.count || 0;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.departments = [];
        state.error = action.payload || "Failed to fetch departments";
      });
  },
});

export const { resetDepartmentState } = departmentSlice.actions;
export default departmentSlice.reducer;
