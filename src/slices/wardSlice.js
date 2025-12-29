import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import wardService from "../services/wardService";

/* =========================
   ASYNC THUNKS
========================= */

// 🔹 Fetch all wards
export const fetchWards = createAsyncThunk(
  "ward/fetchWards",
  async (
    { page = 1, limit = 10, orderBy = "createdAt", order = "DESC", search = "" },
    { rejectWithValue }
  ) => {
    try {
      const res = await wardService.getWards({
        page,
        limit,
        orderBy,
        order,
        search,
      });
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load wards");
    }
  }
);

// 🔹 Fetch ward by id
export const fetchWardById = createAsyncThunk(
  "ward/fetchWardById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await wardService.getWardById(id);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Ward not found");
    }
  }
);

// 🔹 Create ward
export const createWard = createAsyncThunk(
  "ward/createWard",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await wardService.createWard(payload);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Only admin can create ward");
    }
  }
);

// 🔹 Update ward
export const updateWard = createAsyncThunk(
  "ward/updateWard",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await wardService.updateWard(id, data);
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: "Update failed" }
      );
    }
  }
);

// 🔹 Delete ward
export const deleteWard = createAsyncThunk(
  "ward/deleteWard",
  async (id, { rejectWithValue }) => {
    try {
      const res = await wardService.deleteWard(id);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Delete failed");
    }
  }
);

/* =========================
   INITIAL STATE
========================= */

const initialState = {
  wards: [],
  ward: null,

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

/* =========================
   SLICE
========================= */

const wardSlice = createSlice({
  name: "ward",
  initialState,
  reducers: {
    resetWardState: (state) => {
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
      // 🔹 Fetch wards
      .addCase(fetchWards.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWards.fulfilled, (state, action) => {
        state.loading = false;
        state.wards = action.payload.wards || [];
        state.total = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.page = action.meta.arg.page;
        state.limit = action.meta.arg.limit;
      })
      .addCase(fetchWards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Fetch ward by id
      .addCase(fetchWardById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWardById.fulfilled, (state, action) => {
        state.loading = false;
        state.ward = action.payload;
      })
      .addCase(fetchWardById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Create ward
      .addCase(createWard.fulfilled, (state, action) => {
        state.success = true;
        state.wards.unshift(action.payload.data || action.payload);
      })
      .addCase(createWard.rejected, (state, action) => {
        state.error = action.payload;
      })

      // 🔹 Update ward
      .addCase(updateWard.fulfilled, (state, action) => {
        state.success = true;
        const index = state.wards.findIndex(
          (w) => w._id === action.payload._id
        );
        if (index !== -1) state.wards[index] = action.payload;
      })
      .addCase(updateWard.rejected, (state, action) => {
        state.error = action.payload;
      })

      // 🔹 Delete ward
      .addCase(deleteWard.fulfilled, (state, action) => {
        state.success = true;
        state.wards = state.wards.filter(
          (item) => item._id !== action.meta.arg
        );
      })
      .addCase(deleteWard.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { resetWardState, setSort, resetSort } = wardSlice.actions;
export default wardSlice.reducer;
