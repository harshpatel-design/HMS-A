import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import appointmentService from "../services/appointmentService";

export const fetchAppointments = createAsyncThunk(
  "appointment/fetchAppointments",
  async (params, { rejectWithValue }) => {
    try {
      return await appointmentService.getAppointments(params);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  "appointment/fetchAppointmentById",
  async (id, { rejectWithValue }) => {
    try {
      return await appointmentService.getAppointmentById(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createAppointment = createAsyncThunk(
  "appointment/createAppointment",
  async (payload, { rejectWithValue }) => {
    try {
      return await appointmentService.createAppointment(payload);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
export const updateAppointment = createAsyncThunk(
  "appointment/updateAppointment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await appointmentService.updateAppointment(id, data);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  "appointment/deleteAppointment",
  async (id, { rejectWithValue }) => {
    try {
      await appointmentService.deleteAppointment(id);
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  appointments: [],
  appointment: null,

  total: 0,
  totalPages: 1,
  page: 1,
  limit: 10,

  loading: false,
  error: null,
  success: false,
};
const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    resetAppointmentState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;

        state.appointments = action.payload.appointments;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAppointmentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.appointment = action.payload.appointment;
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.appointments.unshift(action.payload.appointment);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const updated = action.payload.appointment;

        const index = state.appointments.findIndex(
          (a) => a._id === updated._id
        );

        if (index !== -1) {
          state.appointments[index] = updated;
        }

        if (state.appointment?._id === updated._id) {
          state.appointment = updated;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.appointments = state.appointments.filter(
          (a) => a._id !== action.payload
        );
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAppointmentState } = appointmentSlice.actions;
export default appointmentSlice.reducer;
