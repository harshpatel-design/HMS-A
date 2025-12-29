import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import patientService from "../services/patientService";

/* =======================================================
   📌 GET ALL PATIENTS
======================================================= */
export const fetchPatients = createAsyncThunk(
  "patient/fetchPatients",
  async (
    { page = 1, limit = 10, orderBy = "createdAt", order = "DESC", search = "" },
    { rejectWithValue }
  ) => {
    try {
      return await patientService.getPatients({
        page,
        limit,
        orderBy,
        order,
        search,
      });
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch patients");
    }
  }
);

/* =======================================================
   📌 GET SINGLE PATIENT
======================================================= */
export const fetchPatientById = createAsyncThunk(
  "patient/fetchPatientById",
  async (id, { rejectWithValue }) => {
    try {
      return await patientService.getPatientById(id);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch patient");
    }
  }
);

/* =======================================================
   🟢 CREATE PATIENT
======================================================= */
export const createPatient = createAsyncThunk(
  "patient/createPatient",
  async (payload, { rejectWithValue }) => {
    try {
      return await patientService.createPatient(payload);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create patient");
    }
  }
);

/* =======================================================
   🟡 UPDATE PATIENT
======================================================= */
export const updatePatient = createAsyncThunk(
  "patient/updatePatient",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await patientService.updatePatient(id, data);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update patient");
    }
  }
);

/* =======================================================
   🔴 DELETE PATIENT
======================================================= */
export const deletePatient = createAsyncThunk(
  "patient/deletePatient",
  async (id, { rejectWithValue }) => {
    try {
      return await patientService.deletePatient(id);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete patient");
    }
  }
);

/* =======================================================
   INITIAL STATE
======================================================= */
const initialState = {
  patients: [],
  patient: null,

  total: 0,
  totalPages: 1,
  page: 1,
  limit: 10,

  loading: false,
  error: null,
  success: false,
};

/* =======================================================
   SLICE
======================================================= */
const patientSlice = createSlice({
  name: "patient",
  initialState,
  reducers: {
    resetPatientState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ================= FETCH ALL ================= */
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;

        state.patients = action.payload.patients;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= FETCH BY ID ================= */
      .addCase(fetchPatientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.loading = false;
        state.patient = action.payload.patient;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= CREATE ================= */
      .addCase(createPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        if (action.payload.patient) {
          state.patients.unshift(action.payload.patient);
        }
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= UPDATE ================= */
      .addCase(updatePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const updated = action.payload.patient;
        const index = state.patients.findIndex(
          (p) => p._id === updated?._id
        );

        if (index !== -1) {
          state.patients[index] = updated;
        }

        state.patient = updated;
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= DELETE ================= */
      .addCase(deletePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.patients = state.patients.filter(
          (p) => p._id !== action.meta.arg
        );
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPatientState } = patientSlice.actions;
export default patientSlice.reducer;
