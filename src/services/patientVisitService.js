import axios from 'axios';
import config from '../Config';

const API_URL = config.API_URL;

const axiosClient = axios.create({
  baseURL: API_URL,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
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
    if (error.response?.status === 403) {
      console.error('Access Denied: Unauthorized role');
    }
    return Promise.reject(error);
  }
);

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch {
    return {};
  }
};

const getRole = () => getCurrentUser()?.role;
// const isAdmin = () => getRole()?.toLowerCase() === 'admin';
const isDoctorOrAdmin = () => ['admin', 'doctor'].includes(getRole()?.toLowerCase());

const getAllPatientVisitService = async ({
  page = 1,
  limit = 10,
  search = '',
  ordering = '-createdAt',
  caseType,
  caseStatus,
  startDate = null,
  endDate = null,
} = {}) => {
  if (!isDoctorOrAdmin()) {
    throw new Error('Access denied: insufficient permissions');
  }

  const res = await axiosClient.get('/api/visits', {
    params: {
      page,
      limit,
      search,
      ordering,
      caseType,
      caseStatus,

      // ✅ date range
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
  });

  return res.data;
};

const getPatientVisitById = async (id) => {
  if (!id) throw new Error('Visit ID is required');
  const res = await axiosClient.get(`/api/visits:/${id}`).then((res) => res.data);
  return res;
};

const createPatientVisitService = async (payload) => {
  if (!isDoctorOrAdmin()) {
    throw new Error('Access denied: Admin or Doctor only');
  }
  const res = await axiosClient.post('/api/visits', payload);
  return res.data;
};

const updatePatientVisitService = async (id, payload) => {
  if (!isDoctorOrAdmin()) {
    throw new Error('Access denied: Admin or Doctor only');
  }
  if (!id) {
    if (!id) throw new Error('Visit ID is required');
  }

  const res = await axiosClient
    .patch(`api/visits/${id}`, payload, { headers: {} })
    .then((res) => res.data);
  return res;
};

const deletePatientVisitService = async (id) => {
  if (!id) {
    throw new Error('Visit ID is required');
  }
  if (!isDoctorOrAdmin()) {
    throw new Error('Admin and Doctor access only');
  }

  const res = await axiosClient.delete(`/api/visits/${id}`);
  return res.data;
};


const patientVisitService = {
  getAllPatientVisitService,
  getPatientVisitById,
  createPatientVisitService,
  updatePatientVisitService,
  deletePatientVisitService,
};

export default patientVisitService;