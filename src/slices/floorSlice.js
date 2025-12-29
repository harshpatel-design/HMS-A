import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import floorService from "../services/floorService";
export const fetchFloors = createAsyncThunk(
    "floor/fetchFloors",
    async (
        { page = 1, limit = 10, orderBy = "createdAt", order = "DESC", search = "" },
        { rejectWithValue }
    ) => {
        try {
            const res = await floorService.getFloors({
                page,
                limit,
                orderBy,
                order,
                search,
            });
            return res;
        } catch (err) {
            return rejectWithValue(err.message || "Failed to load floors");
        }
    }
);

export const fetchFloorById = createAsyncThunk(
    "floor/fetchFloorById",
    async (id, { rejectWithValue }) => {
        try {
            const res = await floorService.getFloorById(id);
            return res;
        } catch (err) {
            return rejectWithValue(err.message || "Floor not found");
        }
    }
);
export const createFloor = createAsyncThunk(
    "floor/createFloor",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await floorService.createFloor(payload);
            return res;
        } catch (err) {
            return rejectWithValue(err.message || "Only admin can create floor");
        }
    }
);

export const updateFloor = createAsyncThunk(
    "floor/updateFloor",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await floorService.updateFloor(id, data);
            return res;
        } catch (err) {
            return rejectWithValue(
                err.response?.data || { message: "Update failed" }
            );
        }
    }
);

export const deleteFloor = createAsyncThunk(
    "floor/deleteFloor",
    async (id, { rejectWithValue }) => {
        try {
            const res = await floorService.deleteFloor(id);
            return res;
        } catch (err) {
            return rejectWithValue(err.message || "Delete failed");
        }
    }
);

const initialState = {
    floors: [],
    floor: null,

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


const floorSlice = createSlice({
    name: "floor",
    initialState,
    reducers: {
        resetFloorState: (state) => {
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
            .addCase(fetchFloors.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFloors.fulfilled, (state, action) => {
                state.loading = false;
                state.floors = action.payload.floors || [];
                state.total = action.payload.total || 0;
                state.totalPages = action.payload.totalPages || 1;
                state.page = action.meta.arg.page;
                state.limit = action.meta.arg.limit;
            })
            .addCase(fetchFloors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchFloorById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFloorById.fulfilled, (state, action) => {
                state.loading = false;
                state.floor = action.payload;
            })
            .addCase(fetchFloorById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createFloor.fulfilled, (state, action) => {
                state.success = true;
                state.floors.unshift(action.payload.data || action.payload);
            })
            .addCase(createFloor.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(updateFloor.fulfilled, (state, action) => {
                state.success = true;
                const index = state.floors.findIndex(
                    (f) => f._id === action.payload._id
                );
                if (index !== -1) state.floors[index] = action.payload;
            })
            .addCase(updateFloor.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteFloor.fulfilled, (state, action) => {
                state.success = true;
                state.floors = state.floors.filter(
                    (item) => item._id !== action.meta.arg
                );
            })
            .addCase(deleteFloor.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { resetFloorState, setSort, resetSort } = floorSlice.actions;
export default floorSlice.reducer;
