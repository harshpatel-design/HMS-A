import axios from 'axios';
import config from '../Config';

const API_URL = config.API_URL;

const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authInterceptor = (config) => {
  const token = localStorage.getItem('auth_token');
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
      window.location.replace('/login');
      break;
    case 403:
      console.error('Access denied ❌');
      break;
    default:
      console.error(error);
  }

  return Promise.reject(error?.response?.data);
};

axiosClient.interceptors.request.use(authInterceptor);
axiosClient.interceptors.response.use((response) => response.data, errorInterceptor);

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch (error) {
    return {};
  }
};

const isAdminOrDoctor = () => {
  const role = getCurrentUser()?.role?.toLowerCase();
  return role === 'admin' || role === 'doctor';
};

const adminDoctorOnly = () => {
  if (!isAdminOrDoctor()) {
    throw new Error('Admin / Doctor Only Access ❌');
  }
};

const createDiagnosis = async (payload) => {
  adminDoctorOnly();
  const res = await axiosClient.post('/api/create-diagnosis', payload);
  return res.data;
};

const getAllDiagnosis = async ({
  page = 1,
  limit = 10,
  search = '',
  orderBy = 'createdAt',
  order = 'DESC',
  startDate = null,
  endDate = null,
} = {}) => {
  const ordering = order === 'DESC' ? `-${orderBy}` : orderBy;

  const res = await axiosClient.get('/api/diagnosis', {
    params: {
      page,
      limit,
      search,
      ordering,
      startDate,
      endDate,
    },
  });
  return res;
};

const getDiagnosisById = async (id) => {
  if (!id) throw new Error('Diagnosis ID is required');
  const res = await axiosClient.get(`/api/diagnosis/${id}`);
  return res.data;
};

const updateDiagnosisById = async (id, payload) => {
  adminDoctorOnly();
  if (!id) throw new Error('Diagnosis ID is required');

  const res = await axiosClient.put(`/api/diagnosis/${id}`, payload);
  return res.data;
};

const diagnosisService = {
  createDiagnosis,
  getAllDiagnosis,
  getDiagnosisById,
  updateDiagnosisById,
};

export default diagnosisService;
