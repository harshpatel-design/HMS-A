import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ipdAdmissionService from "../services/ipdAdmission.service";

export const fetchAllIpdAdmissions = createAsyncThunk(
  "ipd/fetchAllIpdAdmissions",
  async (
    {
      page = 1,
      limit = 10,
      search = "",
      ordering = "createdAt",
      startDate,
      endDate,
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await ipdAdmissionService.getAllIpdAdmissions({
        page,
        limit,
        search,
        ordering,
        startDate,
        endDate,
      });
      return res;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to load IPD admissions" }
      );
    }
  }
);

export const createIpdAdmission = createAsyncThunk(
  "ipd/createIpdAdmission",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await ipdAdmissionService.createIpdAdmission(payload);
      return res;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: err.message || "Create IPD failed" }
      );
    }
  }
);

export const addIpdCharge = createAsyncThunk(
  "ipd/addIpdCharge",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await ipdAdmissionService.addIpdCharge(id, payload);
      return res;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Add charge failed" }
      );
    }
  }
);

export const dischargeIpdPatient = createAsyncThunk(
  "ipd/dischargeIpdPatient",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await ipdAdmissionService.dischargeIpdPatient(id, payload);
      return res;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Discharge failed" }
      );
    }
  }
);

export const fetchActiveIpdByPatient = createAsyncThunk(
  "ipd/fetchActiveIpdByPatient",
  async (patientId, { rejectWithValue }) => {
    try {
      const res = await ipdAdmissionService.getActiveIpdByPatient(patientId);
      return res;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "No active IPD found" }
      );
    }
  }
);



const initialState = {
  ipdAdmissions: [],
  ipdAdmission: null,
  activeIpd: null,

  total: 0,
  totalPages: 1,
  page: 1,
  limit: 10,

  loading: false,
  success: false,
  error: null,
};

const ipdAdmissionSlice = createSlice({
  name: "ipd",
  initialState,
  reducers: {
    resetIpdState: (state) => {
      state.success = false;
      state.error = null;
    },
  },

    extraReducers: (builder) => {
    builder
      .addCase(fetchAllIpdAdmissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllIpdAdmissions.fulfilled, (state, action) => {
        state.loading = false;

        state.ipdAdmissions = action.payload.ipdAdmissions || [];
        state.total = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 1;

        state.page = action.meta.arg.page;
        state.limit = action.meta.arg.limit || 10;
      })
      .addCase(fetchAllIpdAdmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createIpdAdmission.pending, (state) => {
        state.loading = true;
      })
      .addCase(createIpdAdmission.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.ipdAdmission = action.payload.data || action.payload;
      })
      .addCase(createIpdAdmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== ADD CHARGE ===== */
      .addCase(addIpdCharge.fulfilled, (state, action) => {
        state.success = true;
        state.ipdAdmission = action.payload.data || action.payload;
      })
      .addCase(addIpdCharge.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* ===== DISCHARGE ===== */
      .addCase(dischargeIpdPatient.fulfilled, (state, action) => {
        state.success = true;
        state.ipdAdmission = action.payload.data || action.payload;
        state.activeIpd = null;
      })
      .addCase(dischargeIpdPatient.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(fetchActiveIpdByPatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActiveIpdByPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.activeIpd = action.payload.data || action.payload;
      })
      .addCase(fetchActiveIpdByPatient.rejected, (state, action) => {
        state.loading = false;
        state.activeIpd = null;
        state.error = action.payload;
      });
  },
});

export const { resetIpdState } = ipdAdmissionSlice.actions;
export default ipdAdmissionSlice.reducer;
