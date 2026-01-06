import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import patientVisitService from '../services/patientVisitService';

export const fetchPatientVisits = createAsyncThunk(
  'patientVisit/fetchPatientVisits',
  async (
    {
      page = 1,
      limit = 10,
      ordering = '-createdAt',
      search = '',
      caseType,
      caseStatus,
      startDate = null,
      endDate = null,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      return await patientVisitService.getAllPatientVisitService({
        page,
        limit,
        ordering,
        search,
        caseType,
        caseStatus,
        startDate, // ✅ forward
        endDate,   // ✅ forward
      });
    } catch (err) {
      return rejectWithValue(
        err?.message || 'Failed to load visits'
      );
    }
  }
);


export const fetchPatientVisitById = createAsyncThunk(
  'patientVisit/fetchPatientVisitById',
  async (id, { rejectWithValue }) => {
    try {
      if (!id) throw new Error('Visit ID is required');
      return await patientVisitService.getPatientVisitById(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Visit not found');
    }
  }
);

export const createPatientVisit = createAsyncThunk(
  'patientVisit/createPatientVisit',
  async (payload, { rejectWithValue }) => {
    try {
      return await patientVisitService.createPatientVisitService(payload);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create visit');
    }
  }
);

export const updatePatientVisit = createAsyncThunk(
  'patientVisit/updatePatientVisit',
  async ({ visitId, payload }, { rejectWithValue }) => {
    try {
      return await patientVisitService.updatePatientVisitService(visitId, payload);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update visit');
    }
  }
);

export const deletePatientVisit = createAsyncThunk(
  'patientVisit/deletePatientVisit',
  async (visitId, { rejectWithValue }) => {
    try {
      await patientVisitService.deletePatientVisitService(visitId);
      return visitId;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete visit');
    }
  }
);

const initialState = {
  visits: [],
  currentVisit: null,
  selectedVisit: null,
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

const patientVisitSlice = createSlice({
  name: 'patientVisit',
  initialState,
  reducers: {
    clearCurrentVisit: (state) => {
      state.currentVisit = null;
    },
    setSelectedVisit: (state, action) => {
      state.selectedVisit = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientVisits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientVisits.fulfilled, (state, action) => {
        state.loading = false;
        state.visits = action.payload.visits;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchPatientVisits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchPatientVisitById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatientVisitById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVisit = action.payload;
        state.selectedVisit = action.payload;
      })
      .addCase(fetchPatientVisitById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPatientVisit.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPatientVisit.fulfilled, (state, action) => {
        state.loading = false;
        state.visits.unshift(action.payload);
      })
      .addCase(createPatientVisit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePatientVisit.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePatientVisit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deletePatientVisit.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePatientVisit.fulfilled, (state, action) => {
        state.loading = false;
        state.visits = state.visits.filter((v) => v._id !== action.payload);
      })
      .addCase(deletePatientVisit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentVisit, setSelectedVisit } = patientVisitSlice.actions;
export default patientVisitSlice.reducer;
