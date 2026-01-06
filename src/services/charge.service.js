import axios from 'axios';
import config from '../Config';

const API_URL = config.API_URL;

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Token Interceptor
axiosClient.interceptors.request.use((req) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

const getRole = () => JSON.parse(localStorage.getItem('user'))?.role;
const isAdmin = () => getRole() === 'admin';

const createCharge = (payload) => {
  if (!isAdmin()) {
    throw new Error('Admin Only Access ❌');
  }

  return axiosClient.post('/api/create-charges', payload).then((res) => res.data);
};

const getCharges = ({
  page = 1,
  limit = 10,
  search = '',
  orderBy = 'createdAt',
  order = 'DESC',
  startDate,
  endDate,
} = {}) => {
  return axiosClient
    .get('/api/charges', {
      params: { page, limit, search, orderBy, order, startDate, endDate },
    })
    .then((res) => res.data);
};

const getChargeById = (id) => {
  return axiosClient.get(`/api/charges/${id}`).then((res) => res.data);
};

const updateCharge = (id, payload) => {
  if (!isAdmin()) {
    return Promise.reject({ message: 'Admin Only Access ❌' });
  }
  return axiosClient.patch(`/api/charges/${id}`, payload).then((res) => res.data);
};

const deleteCharge = (id) => {
  if (!isAdmin()) {
    throw new Error('Admin Only Access ❌');
  }

  return axiosClient.delete(`/charges/${id}`).then((res) => res.data);
};

const chargeService = {
  createCharge,
  getCharges,
  getChargeById,
  updateCharge,
  deleteCharge,
};

export default chargeService;
