import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import appointmentService from "../services/appointmentService";
export const fetchAppointments = createAsyncThunk(
  "appointment/fetchAppointments",
  async (
    {
      page = 1,
      limit = 10,
      search = "",
      ordering = "-appointmentDate",
      startDate = null,
      endDate = null,
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await appointmentService.getAppointments({
        page,
        limit,
        search,
        ordering,
        startDate,
        endDate,
      });

      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


/* =======================================================
📌 GET SINGLE APPOINTMENT BY ID
======================================================= */
export const fetchAppointmentById = createAsyncThunk(
  "appointment/fetchAppointmentById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await appointmentService.getAppointmentById(id);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* =======================================================
🟢 CREATE APPOINTMENT
======================================================= */
export const createAppointment = createAsyncThunk(
  "appointment/createAppointment",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await appointmentService.createAppointment(payload);

      if (res?.success === false) {
        return rejectWithValue(res);
      }

      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* =======================================================
🟡 UPDATE APPOINTMENT
======================================================= */
export const updateAppointment = createAsyncThunk(
  "appointment/updateAppointment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await appointmentService.updateAppointment(id, data);

      if (res?.success === false) {
        return rejectWithValue(res);
      }

      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* =======================================================
🔴 DELETE APPOINTMENT
======================================================= */
export const deleteAppointment = createAsyncThunk(
  "appointment/deleteAppointment",
  async (id, { rejectWithValue }) => {
    try {
      const res = await appointmentService.deleteAppointment(id);

      if (res?.success === false) {
        return rejectWithValue(res);
      }

      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* =======================================================
INITIAL STATE
======================================================= */
const initialState = {
  appointments: [],
  appointment: null,

  total: 0,
  totalPages: 1,
  page: 1,
  limit: 10,

  search: "",
  ordering: "-appointmentDate",

  loading: false,
  error: null,
  success: false,
};

/* =======================================================
SLICE
======================================================= */
const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    resetAppointmentState: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder

      /* ================= FETCH ALL ================= */
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;

        state.appointments = action.payload.appointments || [];
        state.total = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.page = action.meta.arg.page || 1;
        state.limit = action.meta.arg.limit || 10;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= FETCH BY ID ================= */
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

      /* ================= CREATE ================= */
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const newAppointment =
          action.payload.data ||
          action.payload.appointment ||
          action.payload;

        if (newAppointment) state.appointments.unshift(newAppointment);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= UPDATE ================= */
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const updated =
          action.payload.data ||
          action.payload.appointment ||
          action.payload;

        const index = state.appointments.findIndex(
          (a) => a._id === updated?._id
        );

        if (index !== -1) state.appointments[index] = updated;
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= DELETE ================= */
      .addCase(deleteAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.appointments = state.appointments.filter(
          (item) => item._id !== action.meta.arg
        );
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetAppointmentState } = appointmentSlice.actions;
export default appointmentSlice.reducer;
