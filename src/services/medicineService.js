import Axios from 'axios';
import config from '../Config';

const API_URL = config.API_URL;

const axiosClient = Axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((req) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

const getRole = () => JSON.parse(localStorage.getItem('user'))?.role;
const isAdmin = () => getRole() === 'admin';

const getMedicines = (params = {}) => {
  const { page = 1, limit = 10, search, sortBy = 'createdAt', order = 'DESC', form = '' } = params;

  const queryParams = {
    page,
    limit,
    sortBy,
    order,
    form,
  };

  if (search) {
    queryParams.search = search;
  }

  return axiosClient.get('api/medicines', { params: queryParams }).then((res) => res.data);
};

const getMedicineById = (id) => {
  return axiosClient.get(`api/medicines/${id}`).then((res) => res.data);
};

const createMedicine = (medicineData) => {
  if (!isAdmin()) {
    return Promise.reject(new Error('Admin Only Access'));
  }
  return axiosClient.post('api/medicines', medicineData).then((res) => res.data);
};

const updateMedicine = (id, medicineData) => {
  if (!isAdmin()) {
    return Promise.reject(new Error('Admin Only Access'));
  }
  return axiosClient.patch(`api/medicines/${id}`, medicineData).then((res) => res.data);
};

const deleteMedicine = (id) => {
  if (!isAdmin()) {
    return Promise.reject(new Error('Admin Only Access'));
  }
  return axiosClient.delete(`api/medicines/${id}`).then((res) => res.data);
};

const medicineService = {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};

export default medicineService;
