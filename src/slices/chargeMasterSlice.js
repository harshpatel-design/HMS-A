import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chargeMasterService from "../services/chargeMaster.service";

export const fetchChargeMasters = createAsyncThunk(
  "chargeMaster/fetchChargeMasters",
  async (
    {
      page = 1,
      limit = 20,
      ordering = "-createdAt",
      search = "",
      chargeType,
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await chargeMasterService.getChargeMasters({
        page,
        limit,
        ordering,
        search,
        chargeType,
      });
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to load charge masters"
      );
    }
  }
);

export const fetchChargeMasterById = createAsyncThunk(
  "chargeMaster/fetchChargeMasterById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await chargeMasterService.getChargeMasterById(id);
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Charge master not found"
      );
    }
  }
);

export const createChargeMaster = createAsyncThunk(
  "chargeMaster/createChargeMaster",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await chargeMasterService.createChargeMaster(payload);
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Only admin/accountant can create charge"
      );
    }
  }
);

export const updateChargeMaster = createAsyncThunk(
  "chargeMaster/updateChargeMaster",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await chargeMasterService.updateChargeMaster(id, payload);
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Update failed"
      );
    }
  }
);

export const deleteChargeMaster = createAsyncThunk(
  "chargeMaster/deleteChargeMaster",
  async (id, { rejectWithValue }) => {
    try {
      const res = await chargeMasterService.deleteChargeMaster(id);
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Delete failed"
      );
    }
  }
);

const initialState = {
  chargeMasters: [],
  chargeMaster: null,
  selectedChargeMaster: null,

  total: 0,
  totalPages: 1,
  page: 1,
  limit: 10,

  ordering: "-createdAt",
  search: "",
  chargeType: null,

  loading: false,
  error: null,
  success: false,
};

const chargeMasterSlice = createSlice({
  name: "chargeMaster",
  initialState,
  reducers: {
    resetChargeMasterState: (state) => {
      state.success = false;
      state.error = null;
    },

    setOrdering: (state, action) => {
      state.ordering = action.payload;
    },

    resetOrdering: (state) => {
      state.ordering = "-createdAt";
    },

    setChargeType: (state, action) => {
      state.chargeType = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchChargeMasters.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChargeMasters.fulfilled, (state, action) => {
        state.loading = false;
        state.chargeMasters = action.payload.charges || [];
        state.total = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.page = action.meta.arg.page;
        state.limit = action.meta.arg.limit || 10;
      })
      .addCase(fetchChargeMasters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchChargeMasterById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChargeMasterById.fulfilled, (state, action) => {
        state.loading = false;
        state.chargeMaster = action.payload.charge || action.payload;
        state.selectedChargeMaster =
          action.payload.charge || action.payload;
      })
      .addCase(fetchChargeMasterById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createChargeMaster.fulfilled, (state, action) => {
        state.success = true;
        const newCharge = action.payload.charge || action.payload;
        state.chargeMasters.unshift(newCharge);
      })
      .addCase(createChargeMaster.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(updateChargeMaster.fulfilled, (state, action) => {
        state.success = true;
        const updated = action.payload.charge || action.payload;
        const index = state.chargeMasters.findIndex(
          (c) => c._id === updated._id
        );
        if (index !== -1) {
          state.chargeMasters[index] = updated;
        }
      })
      .addCase(updateChargeMaster.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(deleteChargeMaster.fulfilled, (state, action) => {
        state.success = true;
        state.chargeMasters = state.chargeMasters.filter(
          (c) => c._id !== action.meta.arg
        );
      })
      .addCase(deleteChargeMaster.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  resetChargeMasterState,
  setOrdering,
  resetOrdering,
  setChargeType,
} = chargeMasterSlice.actions;

export default chargeMasterSlice.reducer;
