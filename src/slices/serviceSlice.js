import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import serviceService from "../services/serviceService";

export const fetchServices = createAsyncThunk(
  "service/fetchServices",
  async (
    { page = 1, limit = 10, search = "", ordering = "-createdAt" },
    { rejectWithValue }
  ) => {
    try {
      const res = await serviceService.getServices({
        page,
        limit,
        search,
        ordering,
      });

      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  "service/fetchServiceById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await serviceService.getServiceById(id);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
export const createService = createAsyncThunk(
  "service/createService",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await serviceService.createService(payload);

      if (res?.success === false) return rejectWithValue(res);

      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateService = createAsyncThunk(
  "service/updateService",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await serviceService.updateService(id, data);

      if (res?.success === false) return rejectWithValue(res);

      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteService = createAsyncThunk(
  "service/deleteService",
  async (id, { rejectWithValue }) => {
    try {
      const res = await serviceService.deleteService(id);

      if (res?.success === false) return rejectWithValue(res);

      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  services: [],
  service: null,

  total: 0,
  totalPages: 1,
  page: 1,
  limit: 10,

  search: "",
  ordering: "-createdAt",

  loading: false,
  error: null,
  success: false,
};

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    resetServiceState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;

        state.services = action.payload.services || [];
        state.total = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 1;

        state.page = action.meta.arg.page || 1;
        state.limit = action.meta.arg.limit || 10;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.service = action.payload.service;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createService.pending, (state) => {
        state.loading = true;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const newService = action.payload.service;

        if (newService) state.services.unshift(newService);
      })
      .addCase(createService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateService.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const updatedService = action.payload.service;

        const index = state.services.findIndex(
          (s) => s._id === updatedService?._id
        );

        if (index !== -1) state.services[index] = updatedService;
      })
      .addCase(updateService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteService.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.services = state.services.filter(
          (item) => item._id !== action.meta.arg
        );
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetServiceState } = serviceSlice.actions;
export default serviceSlice.reducer;
