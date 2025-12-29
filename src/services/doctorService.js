import axios from "axios";
import config from "../Config";

const API_URL = config.API_URL;

const axiosClient = axios.create({
    baseURL: API_URL,
});

// 🔥 FIX 1: Token attach automatically for all requests
axiosClient.interceptors.request.use((req) => {
    const token = localStorage.getItem("auth_token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

const getRole = () => JSON.parse(localStorage.getItem("user"))?.role;
const isAdmin = () => getRole() === "admin";

const getDoctors = ({ page = 1, limit = 10, orderBy = "createdAt", order = "DESC", search = "" }) => {
    return axiosClient
        .get("api/doctors/doctors", {
            params: { page, limit, orderBy, order, search },
        })
        .then(res => res.data);
};

const getDoctorById = (id) => {
    return axiosClient
        .get(`api/doctors/doctors/${id}`)
        .then(res => res.data);
};

const createDoctor = (payload) => {
  if (!isAdmin()) {
    throw new Error("Admin Only Access ❌");
  }

  return axiosClient
    .post("api/doctors/create-doctor", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(res => res.data);
};

const updateDoctor = (id, payload) => {
    if (!isAdmin()) return Promise.reject({ message: "Admin Only Access ❌" });
    return axiosClient
        .patch(`api/doctors/doctors/${id}`, payload, { headers: { "Content-Type": "multipart/form-data" } })
        .then(res => res.data)
};
const deleteDoctor = (id) => {
  if (!isAdmin()) {
    throw new Error("Admin Only Access ❌");
  }

  return axiosClient
    .delete(`api/doctors/doctors/${id}`)
    .then(res => res.data);
};

const getDepartments = ({ search = "", sort = "asc" } = {}) => {
  return axiosClient
    .get("/api/departments", {
      params: { search, sort },
    })
    .then(res => res.data);
};

const getSpecializations = () => {
  return axiosClient
    .get("/api/specializations")
    .then(res => res.data);
};
const getDegrees = ({ search = "", sort = "asc", page = 1, limit = 20 } = {}) => {
  return axiosClient
    .get("/api/degrees", {
      params: { search, sort, page, limit },
    })
    .then(res => res.data);
};

const getDoctorNames = ({ search = "", sort = "asc" } = {}) => {
  return axiosClient
    .get("/api/doctors/names", {
      params: { search, sort },
    })
    .then(res => res.data);
};

const doctorService = {
    getDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getDepartments,
    getSpecializations,
    getDegrees,
    getDoctorNames,
};

export default doctorService;
