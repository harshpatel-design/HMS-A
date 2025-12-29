import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import bedService from "../services/bad.service";

export const fetchBeds = createAsyncThunk(
  "bed/fetchBeds",
  async (
    {
      page = 1,
      limit = 10,
      orderBy = "createdAt",
      order = "DESC",
      search,
      floor,
      ward,
      room,
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await bedService.getBeds({
        page,
        limit,
        orderBy,
        order,
        search,
        floor,
        ward,
        room,
      });
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load beds");
    }
  }
);

export const fetchBedById = createAsyncThunk(
  "bed/fetchBedById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await bedService.getBedById(id);
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Bed not found"
      );
    }
  }
);

export const createBed = createAsyncThunk(
  "bed/createBed",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await bedService.createBed(payload);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Only admin can create bed");
    }
  }
);

export const updateBed = createAsyncThunk(
  "bed/updateBed",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await bedService.updateBed(id, payload);
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Update failed" }
      );
    }
  }
);

export const deleteBed = createAsyncThunk(
  "bed/deleteBed",
  async (id, { rejectWithValue }) => {
    try {
      const res = await bedService.deleteBed(id);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Delete failed");
    }
  }
);

const initialState = {
  beds: [],
  bed: null,
  selectedBed: null,

  total: 0,
  totalPages: 1,
  page: 1,
  limit: 10,

  orderBy: "createdAt",
  order: "DESC",
  search: "",

  loading: false,
  error: null,
  success: false,
};

const bedSlice = createSlice({
  name: "bed",
  initialState,
  reducers: {
    resetBedState: (state) => {
      state.success = false;
      state.error = null;
    },

    setSort: (state, action) => {
      state.orderBy = action.payload.orderBy;
      state.order = action.payload.order;
    },

    resetSort: (state) => {
      state.orderBy = "createdAt";
      state.order = "DESC";
    },
  },

  extraReducers: (builder) => {
    builder
      /* ===== FETCH BEDS ===== */
      .addCase(fetchBeds.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBeds.fulfilled, (state, action) => {
        state.loading = false;
        state.beds = action.payload.data || [];
        state.total = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.page = action.meta.arg.page;
        state.limit = action.meta.arg.limit || 10;
      })
      .addCase(fetchBeds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== FETCH BED BY ID ===== */
      .addCase(fetchBedById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBedById.fulfilled, (state, action) => {
        state.loading = false;
        state.bed = action.payload;
        state.selectedBed = action.payload;
      })
      .addCase(fetchBedById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== CREATE BED ===== */
      .addCase(createBed.fulfilled, (state, action) => {
        state.success = true;
        state.beds.unshift(action.payload.data || action.payload);
      })
      .addCase(createBed.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* ===== UPDATE BED ===== */
      .addCase(updateBed.fulfilled, (state, action) => {
        state.success = true;
        const updatedBed = action.payload.data || action.payload;
        const index = state.beds.findIndex((b) => b._id === updatedBed._id);

        if (index !== -1) {
          state.beds[index] = updatedBed;
        }
      })
      .addCase(updateBed.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(deleteBed.fulfilled, (state, action) => {
        state.success = true;
        state.beds = state.beds.filter((item) => item._id !== action.meta.arg);
      })
      .addCase(deleteBed.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { resetBedState, setSort, resetSort } = bedSlice.actions;
export default bedSlice.reducer;
