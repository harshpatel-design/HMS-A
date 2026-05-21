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
  (error) => Promise.reject(error)
);

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch {
    return {};
  }
};

const getRole = () => getCurrentUser()?.role;
const isAdmin = () => getRole()?.toLowerCase() === 'admin';

const getServices = async ({ page = 1, limit = 10, search = '', ordering = '-createdAt' }) => {
  try {
    const response = await axiosClient.get('/api/services', {
      params: { page, limit, search, ordering },
    });

    return response.data;
  } catch (err) {
    return err.response?.data || { message: 'Failed to fetch services' };
  }
};

const getServiceById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/services/${id}`);
    return response.data;
  } catch (err) {
    return err.response?.data || { message: 'Service not found' };
  }
};

const createService = async (payload) => {
  if (!isAdmin()) {
    return Promise.reject({ message: 'Admin Only Access ❌' });
  }

  try {
    const response = await axiosClient.post('/api/services/create-service', payload);
    return response.data;
  } catch (err) {
    return Promise.reject(err.response?.data || { message: 'Create Service Failed' });
  }
};

const updateService = async (id, payload) => {
  if (!isAdmin()) {
    return Promise.reject({ message: 'Admin Only Access ❌' });
  }

  try {
    const response = await axiosClient.patch(`/api/services/${id}`, payload);
    return response.data;
  } catch (err) {
    return Promise.reject(err.response?.data || { message: 'Update Service Failed' });
  }
};

const deleteService = async (id) => {
  if (!isAdmin()) {
    return Promise.reject({ message: 'Admin Only Access ❌' });
  }

  try {
    const response = await axiosClient.delete(`/api/services/${id}`);
    return response.data;
  } catch (err) {
    return Promise.reject({
      message: err.response?.data?.message || 'Failed to delete service',
    });
  }
};

const serviceService = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};

export default serviceService;
