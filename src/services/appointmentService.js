import axios from "axios";
import config from "../Config";

const API_URL = config.API_URL;

const axiosClient = axios.create({
    baseURL: API_URL,
});

/* ---------------------- TOKEN INTERCEPTOR ---------------------- */
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/* ---------------------- RESPONSE INTERCEPTOR ---------------------- */
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403) {
            console.error("Access Denied: Unauthorized role");
        }
        return Promise.reject(error);
    }
);

/* ---------------------- HELPERS ---------------------- */
const getCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
        return {};
    }
};

const getRole = () => getCurrentUser()?.role;
const isAdmin = () => getRole()?.toLowerCase() === "admin";
const isDoctorOrAdmin = () =>
    ["admin", "doctor", "staff"].includes(getRole()?.toLowerCase());

/* =======================================================
📌 GET ALL APPOINTMENTS
======================================================= */
const getAppointments = async ({
    page = 1,
    limit = 10,
    search = "",
    ordering = "-appointmentDate",
    startDate = null,
    endDate = null,
}) => {
    try {
        const response = await axiosClient.get("/api/appointments", {
            params: {
                page,
                limit,
                search,
                ordering,
                startDate,
                endDate,
            },
        });

        return response.data;
    } catch (err) {
        return err.response?.data || { message: "Failed to fetch appointments" };
    }
};


/* =======================================================
📌 GET APPOINTMENT BY ID
======================================================= */
const getAppointmentById = async (id) => {
    try {
        const response = await axiosClient.get(`/api/appointments/${id}`);
        return response.data;
    } catch (err) {
        return err.response?.data || { message: "Appointment not found" };
    }
};

/* =======================================================
📌 CREATE APPOINTMENT
======================================================= */
const createAppointment = async (payload) => {
    if (!isDoctorOrAdmin()) {
        return Promise.reject({ message: "Access Denied ❌" });
    }

    try {
        const response = await axiosClient.post("/api/appointments", payload);
        return response.data;
    } catch (err) {
        return Promise.reject(
            err.response?.data || { message: "Create Appointment Failed" }
        );
    }
};

/* =======================================================
📌 UPDATE APPOINTMENT
======================================================= */
const updateAppointment = async (id, payload) => {
    if (!isDoctorOrAdmin()) {
        return Promise.reject({ message: "Access Denied ❌" });
    }

    try {
        const response = await axiosClient.patch(
            `/api/appointments/${id}`,
            payload
        );
        return response.data;
    } catch (err) {
        return Promise.reject(
            err.response?.data || { message: "Update Appointment Failed" }
        );
    }
};

const deleteAppointment = async (id) => {
    if (!isAdmin()) {
        return Promise.reject({ message: "Admin Only Access ❌" });
    }

    try {
        const response = await axiosClient.delete(`/api/appointments/${id}`);
        return response.data;
    } catch (err) {
        throw {
            message: err.response?.data?.message || "Failed to delete appointment",
        };
    }
};

/* =======================================================
📌 GET AVAILABLE DOCTOR SLOTS (Optional API)
======================================================= */
const getDoctorAvailableSlots = async ({
    doctorId,
    date,
}) => {
    try {
        const response = await axiosClient.get(`/api/appointments/slots`, {
            params: { doctorId, date }
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching available slots:", error);
        throw new Error(
            error.response?.data?.message || "Failed to fetch available slots"
        );
    }
};

/* =======================================================
📌 EXPORT SERVICE
======================================================= */
const appointmentService = {
    getAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getDoctorAvailableSlots,
};

export default appointmentService;
