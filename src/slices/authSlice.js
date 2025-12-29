import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../services/AuthService";

/* =========================================================
   🔥 LOGIN THUNK
========================================================= */
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await authService.login({ email, password });

            if (!response?.token) {
                return rejectWithValue({
                    message: response.message || "Invalid credentials",
                    success: false,
                });
            }

            return response; // Contains token + user
        } catch (error) {
            return rejectWithValue(
                error?.response?.data || { message: "Login failed", success: false }
            );
        }
    }
);

/* =========================================================
   🔥 LOGOUT THUNK (CALL API + CLEAR STORAGE)
========================================================= */
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
    await authService.logout();     // <-- calls backend + removes local storage
    return true;
});


/* =========================================================
   🔥 GET LOGGED IN USER
========================================================= */
export const fetchUserProfile = createAsyncThunk(
    "auth/fetchMe",
    async (_, { rejectWithValue }) => {
        try {
            return await authService.getMe();
        } catch (err) {
            return rejectWithValue("Unable to load profile");
        }
    }
);

/* =========================================================
   🔥 UPLOAD PROFILE IMAGE
========================================================= */
export const uploadUserImage = createAsyncThunk(
    "auth/uploadImage",
    async (formData, { rejectWithValue }) => {
        try {
            const updatedUser = await authService.uploadImage(formData);
            localStorage.setItem("user", JSON.stringify(updatedUser)); // sync on update
            return updatedUser;
        } catch (err) {
            return rejectWithValue("Image upload failed");
        }
    }
);

/* =========================================================
   INITIAL STATE
========================================================= */
const initialState = {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("auth_token") || null,
    isAuthenticated: !!localStorage.getItem("auth_token"),
    loading: false,
    error: null,
    authMessage: null,
};

/* =========================================================
   AUTH SLICE
========================================================= */
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearAuthState: (state) => {
            state.authMessage = null;
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder

            /* -------- LOGIN -------- */
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.authMessage = "Login Successful 🎉";
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.token = null;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload?.message;
            })

            /* -------- LOGOUT -------- */
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.authMessage = null;
                state.error = null;
            })
            /* -------- FETCH PROFILE -------- */
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchUserProfile.rejected, (state) => {
                state.loading = false;
            })

            /* -------- UPLOAD IMAGE -------- */
            .addCase(uploadUserImage.pending, (state) => {
                state.loading = true;
            })
            .addCase(uploadUserImage.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;   // update image instantly
            })
            .addCase(uploadUserImage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

    },
});

export const { clearAuthState } = authSlice.actions;
export default authSlice.reducer;
