import axios from "axios";
import config from "../Config";

const API_URL = config.API_URL;

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Auth Token Interceptor
axiosClient.interceptors.request.use((req) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

const getRole = () => JSON.parse(localStorage.getItem("user"))?.role;
const isAdmin = () => getRole() === "admin";


const getAllIpdAdmissions = ({
  page = 1,
  limit = 10,
  search = "",
  ordering = "createdAt",
  startDate,
  endDate,
} = {}) => {
  return axiosClient
    .get("/api/ipd-admissions", {
      params: {
        page,
        limit,
        search,
        ordering,
        startDate,
        endDate,
      },
    })
    .then((res) => res.data);
};


const createIpdAdmission = (payload) => {
  if (!isAdmin()) {
    throw new Error('Admin Only Access ❌');
  }
  if (Array.isArray(payload.charges)) {
    return axiosClient.post('/api/ipd-admissions', payload).then((res) => res.data);
  }

  return axiosClient.post('/api/ipd-admissions', payload).then((res) => res.data);
};

const updateIpdAdmission = (payload) => {

  if (!isAdmin()) {
    throw new Error('Admin Only Access ❌');
  }
  if (Array.isArray(payload.charges)) {
    return axiosClient.post('/api/ipd-admissions/:id', payload).then((res) => res.data);
  }


};

const addIpdCharge = (ipdAdmissionId, payload) => {
  if (!isAdmin()) {
    throw new Error("Admin Only Access ❌");
  }

  return axiosClient
    .post(`/api/ipd-admissions/${ipdAdmissionId}/charge`, payload)
    .then((res) => res.data);
};

const dischargeIpdPatient = (ipdAdmissionId, payload = {}) => {
  if (!isAdmin()) {
    throw new Error("Admin Only Access ❌");
  }

  return axiosClient
    .patch(`/api/ipd-admissions/${ipdAdmissionId}/discharge`, payload)
    .then((res) => res.data);
};

const getActiveIpdByPatient = (patientId) => {
  return axiosClient
    .get(`/api/ipd-admissions/active/${patientId}`)
    .then((res) => res.data);
};


const ipdAdmissionService = {
  createIpdAdmission,
  addIpdCharge,
  dischargeIpdPatient,
  getActiveIpdByPatient,
  getAllIpdAdmissions,
  updateIpdAdmission
};

export default ipdAdmissionService;
