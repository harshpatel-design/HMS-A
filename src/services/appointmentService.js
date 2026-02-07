import axios from "axios";
import config from "../Config";

const API_URL = config.API_URL;

const axiosClient = axios.create({
  baseURL: API_URL,
});

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

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized – please login again");
    }
    if (error.response?.status === 403) {
      console.error("Forbidden – insufficient permissions");
    }
    return Promise.reject(error);
  }
);

const getAppointments = async ({
  page = 1,
  limit = 10,
  search = "",
  ordering = "-appointmentDate",
  startDate = null,
  endDate = null,
} = {}) => {
  try {
    const { data } = await axiosClient.get("/api/appointments", {
      params: {
        page,
        limit,
        search,
        ordering,
        startDate,
        endDate,
      },
    });

    return data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch appointments" };
  }
};

const getAppointmentById = async (id) => {
  try {
    const { data } = await axiosClient.get(`/api/appointments/${id}`);
    return data;
  } catch (err) {
    throw err.response?.data || { message: "Appointment not found" };
  }
};

const createAppointment = async (payload) => {
  try {
    const { data } = await axiosClient.post("/api/appointments", payload);
    return data;
  } catch (err) {
    throw err.response?.data || { message: "Create appointment failed" };
  }
};

const updateAppointment = async (id, payload) => {
  try {
    const { data } = await axiosClient.patch(
      `/api/appointments/${id}`,
      payload
    );
    return data;
  } catch (err) {
    throw err.response?.data || { message: "Update appointment failed" };
  }
};

const deleteAppointment = async (id) => {
  try {
    const { data } = await axiosClient.delete(`/api/appointments/${id}`);
    return data;
  } catch (err) {
    throw err.response?.data || { message: "Cancel appointment failed" };
  }
};

const getDoctorAvailableSlots = async ({ doctorId, date }) => {
  try {
    const { data } = await axiosClient.get("/api/appointments/slots", {
      params: { doctorId, date },
    });
    return data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch available slots" };
  }
};

const appointmentService = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getDoctorAvailableSlots,
};

export default appointmentService;
