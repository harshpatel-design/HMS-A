import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import recipientService from "../services/recipientService";

/* =======================================================
   📌 GET ALL RECIPIENTS
======================================================= */
export const fetchRecipients = createAsyncThunk(
  "recipient/fetchRecipients",
  async (
    { page = 1, limit = 10, orderBy = "createdAt", order = "DESC", search = "" },
    { rejectWithValue }
  ) => {
    try {
      const res = await recipientService.getRecipients({
        page,
        limit,
        orderBy,
        order,
        search,
      });
      return res; // { recipients, total, limit, page, totalPages }
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load recipients");
    }
  }
);

/* =======================================================
   📌 GET RECIPIENT BY ID
======================================================= */
export const fetchRecipientById = createAsyncThunk(
  "recipient/fetchRecipientById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await recipientService.getRecipientById(id);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Recipient not found");
    }
  }
);

/* =======================================================
   🔒 CREATE RECIPIENT (ADMIN)
======================================================= */
export const createRecipient = createAsyncThunk(
  "recipient/createRecipient",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await recipientService.createRecipient(payload);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Only admin can create recipient");
    }
  }
);

/* =======================================================
   🔒 UPDATE RECIPIENT (ADMIN)
======================================================= */
export const updateRecipient = createAsyncThunk(
  "recipient/updateRecipient",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await recipientService.updateRecipient(id, data);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Update failed");
    }
  }
);

/* =======================================================
   🔒 DELETE RECIPIENT (ADMIN)
======================================================= */
export const deleteRecipient = createAsyncThunk(
  "recipient/deleteRecipient",
  async (id, { rejectWithValue }) => {
    try {
      const res = await recipientService.deleteRecipient(id);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Delete failed");
    }
  }
);

/* =======================================================
   🔥 INITIAL STATE
======================================================= */
const initialState = {
  recipients: [],
  recipient: null,

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

/* =======================================================
   REDUX SLICE
======================================================= */
const recipientSlice = createSlice({
  name: "recipient",
  initialState,
  reducers: {
    resetRecipientState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ================= FETCH ALL ================= */
      .addCase(fetchRecipients.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecipients.fulfilled, (state, action) => {
        state.loading = false;
        state.recipients = action.payload.recipients || [];
        state.total = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.page = action.meta.arg.page;
        state.limit = action.meta.arg.limit;
      })
      .addCase(fetchRecipients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= FETCH BY ID ================= */
      .addCase(fetchRecipientById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecipientById.fulfilled, (state, action) => {
        state.loading = false;
        state.recipient = action.payload;
      })
      .addCase(fetchRecipientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= CREATE ================= */
      .addCase(createRecipient.fulfilled, (state, action) => {
        state.success = true;
        state.recipients.unshift(action.payload.data || action.payload);
      })
      .addCase(createRecipient.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* ================= UPDATE ================= */
      .addCase(updateRecipient.fulfilled, (state, action) => {
        state.success = true;
        const index = state.recipients.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) state.recipients[index] = action.payload;
      })
      .addCase(updateRecipient.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* ================= DELETE ================= */
      .addCase(deleteRecipient.fulfilled, (state, action) => {
        state.success = true;
        state.recipients = state.recipients.filter(
          (item) => item._id !== action.meta.arg
        );
      })
      .addCase(deleteRecipient.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { resetRecipientState } = recipientSlice.actions;
export default recipientSlice.reducer;
