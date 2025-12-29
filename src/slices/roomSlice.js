import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import roomService from "../services/roomService";

/* =========================
   ASYNC THUNKS
========================= */

// 🔹 Fetch all rooms
export const fetchRooms = createAsyncThunk(
    "room/fetchRooms",
    async (
        { page = 1, limit = 10, orderBy = "createdAt", order = "DESC", search = "" },
        { rejectWithValue }
    ) => {
        try {
            const res = await roomService.getRooms({
                page,
                limit,
                orderBy,
                order,
                search,
            });
            return res;
        } catch (err) {
            return rejectWithValue(err.message || "Failed to load rooms");
        }
    }
);

// 🔹 Fetch room by id
export const fetchRoomById = createAsyncThunk(
    "room/fetchRoomById",
    async (id, { rejectWithValue }) => {
        try {
            const res = await roomService.getRoomById(id);
            return res;
        } catch (err) {
            return rejectWithValue(err.message || "Room not found");
        }
    }
);

// 🔹 Create room
export const createRoom = createAsyncThunk(
    "room/createRoom",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await roomService.createRoom(payload);
            return res;
        } catch (err) {
            return rejectWithValue(err.message || "Only admin can create room");
        }
    }
);

// 🔹 Update room
export const updateRoom = createAsyncThunk(
    "room/updateRoom",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await roomService.updateRoom(id, data);
            return res;
        } catch (err) {
            return rejectWithValue(
                err.response?.data || { message: "Update failed" }
            );
        }
    }
);

// 🔹 Delete room
export const deleteRoom = createAsyncThunk(
    "room/deleteRoom",
    async (id, { rejectWithValue }) => {
        try {
            const res = await roomService.deleteRoom(id);
            return res;
        } catch (err) {
            return rejectWithValue(err.message || "Delete failed");
        }
    }
);

/* =========================
   INITIAL STATE
========================= */

const initialState = {
    rooms: [],
    room: null,

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

/* =========================
   SLICE
========================= */

const roomSlice = createSlice({
    name: "room",
    initialState,
    reducers: {
        resetRoomState: (state) => {
            state.success = false;
            state.error = null;
        },
        setSort: (state, action) => {
            state.orderBy = action.payload.orderBy;
            state.order = action.payload.order;
        },
        resetSort: (state) => {
            state.orderBy = "createdAt";
            state.order = "DESC";
        },
    },
    extraReducers: (builder) => {
        builder
            // 🔹 Fetch rooms
            .addCase(fetchRooms.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRooms.fulfilled, (state, action) => {
                state.loading = false;
                state.rooms = action.payload.rooms || [];
                state.total = action.payload.total || 0;
                state.totalPages = action.payload.totalPages || 1;
                state.page = action.meta.arg.page;
                state.limit = action.meta.arg.limit;
            })
            .addCase(fetchRooms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🔹 Fetch room by id
            .addCase(fetchRoomById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRoomById.fulfilled, (state, action) => {
                state.loading = false;
                state.room = action.payload;
            })
            .addCase(fetchRoomById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🔹 Create room
            .addCase(createRoom.fulfilled, (state, action) => {
                state.success = true;
                state.rooms.unshift(action.payload.data || action.payload);
            })
            .addCase(createRoom.rejected, (state, action) => {
                state.error = action.payload;
            })

            // 🔹 Update room
            .addCase(updateRoom.fulfilled, (state, action) => {
                state.success = true;
                const index = state.rooms.findIndex(
                    (r) => r._id === action.payload._id
                );
                if (index !== -1) state.rooms[index] = action.payload;
            })
            .addCase(updateRoom.rejected, (state, action) => {
                state.error = action.payload;
            })

            // 🔹 Delete room
            .addCase(deleteRoom.fulfilled, (state) => {
                state.success = true;
                state.rooms = state.rooms.filter(
                    (item) => item._id !== state.room?._id
                );
            })
            .addCase(deleteRoom.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { resetRoomState, setSort, resetSort } = roomSlice.actions;
export default roomSlice.reducer;
