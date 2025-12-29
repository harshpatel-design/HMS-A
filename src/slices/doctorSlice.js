import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import doctorService from "../services/doctorService";

export const fetchDoctors = createAsyncThunk(
  "doctor/fetchDoctors",
  async ({ page = 1, limit = 10, orderBy = "createdAt", order = "DESC", search = "" }, { rejectWithValue }) => {
    try {
      const res = await doctorService.getDoctors({ page, limit, orderBy, order, search });
      return res;  // { doctors, total, limit, page, totalPages }
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load doctors");
    }
  }
);

export const fetchDoctorById = createAsyncThunk(
  "doctor/fetchDoctorById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await doctorService.getDoctorById(id);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Doctor not found");
    }
  }
);

export const createDoctor = createAsyncThunk(
  "doctor/createDoctor",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await doctorService.createDoctor(payload);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Only admin can create doctor");
    }
  }
);

export const updateDoctor = createAsyncThunk(
  "doctor/updateDoctor",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await doctorService.updateDoctor(id, data);
      return res;
    } catch (err) {
      console.log(err);
      return rejectWithValue(err.response?.data || { message: "Update Failed" });
    }
  }
);

export const deleteDoctor = createAsyncThunk(
  "doctor/deleteDoctor",
  async (id, { rejectWithValue }) => {
    try {
      const res = await doctorService.deleteDoctor(id);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Delete failed");
    }
  }
);

const initialState = {
  doctors: [],
  doctor: null,
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

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    resetDoctorState: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchDoctors.pending, (state) => { state.loading = true; })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload.doctors || [];
        state.total = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.page = action.meta.arg.page;
        state.limit = action.meta.arg.limit;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchDoctorById.pending, (state) => { state.loading = true; })
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.loading = false;
        state.doctor = action.payload;
      })
      .addCase(fetchDoctorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createDoctor.fulfilled, (state, action) => {
        state.success = true;
        state.doctors.unshift(action.payload.data || action.payload);
      })
      .addCase(createDoctor.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(updateDoctor.fulfilled, (state, action) => {
        state.success = true;
        const index = state.doctors.findIndex(d => d._id === action.payload._id);
        if (index !== -1) state.doctors[index] = action.payload;
      })
      .addCase(updateDoctor.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.success = true;
        state.doctors = state.doctors.filter(item => item._id !== action.meta.arg);
      })
      .addCase(deleteDoctor.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { resetDoctorState } = doctorSlice.actions;
export default doctorSlice.reducer;
