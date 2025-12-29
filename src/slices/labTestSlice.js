import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import labTestService from "../services/labTest.service";

export const fetchLabTests = createAsyncThunk(
  "labTest/fetchLabTests",
  async (
    {
      page = 1,
      limit = 20,
      ordering = "-createdAt",
      search = "",
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await labTestService.getLabTests({
        page,
        limit,
        ordering,
        search,
      });
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to load lab tests"
      );
    }
  }
);

export const fetchLabTestById = createAsyncThunk(
  "labTest/fetchLabTestById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await labTestService.getLabTestById(id);
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Lab test not found"
      );
    }
  }
);

export const createLabTest = createAsyncThunk(
  "labTest/createLabTest",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await labTestService.createLabTest(payload);
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Only admin can create lab test"
      );
    }
  }
);

export const updateLabTest = createAsyncThunk(
  "labTest/updateLabTest",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await labTestService.updateLabTest(id, payload);
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Update failed"
      );
    }
  }
);

export const deleteLabTest = createAsyncThunk(
  "labTest/deleteLabTest",
  async (id, { rejectWithValue }) => {
    try {
      const res = await labTestService.deleteLabTest(id);
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Delete failed"
      );
    }
  }
);

const initialState = {
  labTests: [],
  labTest: null,
  selectedLabTest: null,

  total: 0,
  totalPages: 1,
  page: 1,
  limit: 10,

  ordering: "-createdAt",
  search: "",

  loading: false,
  error: null,
  success: false,
};

const labTestSlice = createSlice({
  name: "labTest",
  initialState,
  reducers: {
    resetLabTestState: (state) => {
      state.success = false;
      state.error = null;
    },

    setOrdering: (state, action) => {
      state.ordering = action.payload;
    },

    resetOrdering: (state) => {
      state.ordering = "-createdAt";
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchLabTests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLabTests.fulfilled, (state, action) => {
        state.loading = false;
        state.labTests = action.payload.labTests || [];
        state.total = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.page = action.meta.arg.page;
        state.limit = action.meta.arg.limit || 10;
      })
      .addCase(fetchLabTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchLabTestById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLabTestById.fulfilled, (state, action) => {
        state.loading = false;
        state.labTest = action.payload.labTest || action.payload;
        state.selectedLabTest = action.payload.labTest || action.payload;
      })
      .addCase(fetchLabTestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createLabTest.fulfilled, (state, action) => {
        state.success = true;
        const newTest = action.payload.labTest || action.payload;
        state.labTests.unshift(newTest);
      })
      .addCase(createLabTest.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(updateLabTest.fulfilled, (state, action) => {
        state.success = true;
        const updated = action.payload.labTest || action.payload;
        const index = state.labTests.findIndex(
          (t) => t._id === updated._id
        );
        if (index !== -1) {
          state.labTests[index] = updated;
        }
      })
      .addCase(updateLabTest.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteLabTest.fulfilled, (state, action) => {
        state.success = true;
        state.labTests = state.labTests.filter(
          (t) => t._id !== action.meta.arg
        );
      })
      .addCase(deleteLabTest.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  resetLabTestState,
  setOrdering,
  resetOrdering,
} = labTestSlice.actions;

export default labTestSlice.reducer;
