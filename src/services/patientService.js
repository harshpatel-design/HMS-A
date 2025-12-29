import axios from "axios";
import config from "../Config";

const API_URL = config.API_URL;

/* =========================================================
   AXIOS CLIENT
========================================================= */
const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

/* =========================================================
   REQUEST INTERCEPTOR (TOKEN)
========================================================= */
axiosClient.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

/* =========================================================
   RESPONSE INTERCEPTOR (GLOBAL ERROR)
========================================================= */
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    if (status === 403) {
      console.error("Access denied ❌");
    }

    return Promise.reject(
      error.response?.data || { message: "Something went wrong" }
    );
  }
);

/* =========================================================
   HELPERS
========================================================= */
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
};

const isAdmin = () =>
  getCurrentUser()?.role?.toLowerCase() === "admin";

const adminOnly = () => {
  if (!isAdmin()) {
    throw new Error("Admin Only Access ❌");
  }
};

/* =========================================================
   PATIENT APIS
========================================================= */
const getPatients = async ({
  page = 1,
  limit = 10,
  orderBy = "createdAt",
  order = "DESC",
  search = "",
}) => {
  return await axiosClient.get("/api/patients/patients", {
    params: { page, limit, orderBy, order, search },
  });
};

const getPatientById = async (id) => {
  if (!id) throw new Error("Patient ID is required");
  return await axiosClient.get(`/api/patients/patients/${id}`);
};

const createPatient = async (payload) => {
  adminOnly();

  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "documents") return;

    if (typeof value === "object" && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value ?? "");
    }
  });

  if (payload.documents?.length > 0) {
    payload.documents.forEach((file) =>
      formData.append("documents", file)
    );
  }

  return await axiosClient.post(
    "/api/patients/patients",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
};

const updatePatient = async (id, payload) => {
  adminOnly();
  if (!id) throw new Error("Patient ID is required");

  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "documents") return;

    // 🟢 IMPORTANT FIX (your logic preserved)
    if (key === "opd" && value && !value.doctor) delete value.doctor;
    if (key === "ipd" && value && !value.doctor) delete value.doctor;

    if (typeof value === "object" && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value ?? "");
    }
  });

  if (payload.documents?.length > 0) {
    payload.documents.forEach((file) =>
      formData.append("documents", file)
    );
  }

  return await axiosClient.patch(
    `/api/patients/patients/${id}`,
    formData
  );
};

const deletePatient = async (id) => {
  adminOnly();
  if (!id) throw new Error("Patient ID is required");

  return await axiosClient.delete(`/api/patients/patients/${id}`);
};

const getPatientNames = async ({ search = "" } = {}) => {
  return await axiosClient.get(
    "/api/patients/patients-names",
    { params: { search } }
  );
};

/* =========================================================
   EXPORT
========================================================= */
const patientService = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientNames,
};

export default patientService;
