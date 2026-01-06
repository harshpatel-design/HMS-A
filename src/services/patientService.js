import axios from 'axios';
import config from '../Config';

const API_URL = config.API_URL;
const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

const authInterceptor = (config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const errorInterceptor = (error) => {
  const status = error?.response?.status;

  switch (status) {
    case 401:
      localStorage.clear();
      window.location.replace("/login");
      break;
    case 403:
      console.error("Access denied ❌");
      break;
    default:
      console.error(error);
  }

  return Promise.reject(error?.response?.data);
};

axiosClient.interceptors.request.use(authInterceptor);
axiosClient.interceptors.response.use(
  (response) => response.data,
  errorInterceptor
);

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch {
    return {};
  }
};

const isAdmin = () => getCurrentUser()?.role?.toLowerCase() === 'admin';

const adminOnly = () => {
  if (!isAdmin()) {
    throw new Error('Admin Only Access ❌');
  }
};


const getPatients = async ({
  page = 1,
  limit = 10,
  orderBy = "createdAt",
  order = "DESC",
  search = "",
  startDate = null,
  endDate = null,
}) => {
  const ordering = order === "DESC" ? `-${orderBy}` : orderBy;

  return await axiosClient.get("/api/patients/patients", {
    params: {
      page,
      limit,
      search,
      ordering,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
  });
};


const getPatientById = async (id) => {
  if (!id) throw new Error('Patient ID is required');
  return await axiosClient.get(`/api/patients/patients/${id}`);
};

const createPatient = async (payload) => {
  adminOnly();

  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'documents') return;

    if (value === undefined || value === null) return

    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  if (payload.documents?.length > 0) {
    payload.documents.forEach((file) => formData.append('documents', file));
  }
  return await axiosClient.post('/api/patients/patients', formData);
};

const updatePatient = async (id, payload) => {
  adminOnly();
  if (!id) throw new Error('Patient ID is required');

  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'documents') return;

    // 🟢 IMPORTANT FIX (your logic preserved)
    if (key === 'opd' && value && !value.doctor) delete value.doctor;
    if (key === 'ipd' && value && !value.doctor) delete value.doctor;

    if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value ?? '');
    }
  });

  if (payload.documents?.length > 0) {
    payload.documents.forEach((file) => formData.append('documents', file));
  }

  return await axiosClient.patch(`/api/patients/patients/${id}`, formData);
};

const deletePatient = async (id) => {
  adminOnly();
  if (!id) throw new Error('Patient ID is required');

  return await axiosClient.delete(`/api/patients/patients/${id}`);
};

const getPatientNames = async ({ search = '' } = {}) => {
  const res = await axiosClient.get(
    '/api/patients/patients-names',
    {
      params: { search },
    }
  );

  return res;
};


const patientService = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientNames,
};

export default patientService;
