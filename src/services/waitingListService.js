import axios from 'axios';
import config from '../Config';

const API_URL = config.API_URL;

const axiosClient = axios.create({
  baseURL: API_URL,
});

axiosClient.interceptors.request.use((req) => {
  const token = localStorage.getItem('auth_token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

const getRole = () => JSON.parse(localStorage.getItem('user'))?.role;
const isAdmin = () => getRole() === 'admin';
const isReceptionist = () => getRole() === 'receptionist';
const isDoctor = () => getRole() === 'doctor';

const addToWaitingList = (payload) => {
  if (!isAdmin() && !isReceptionist()) {
    return Promise.reject({ message: 'Unauthorized Access ❌' });
  }

  return axiosClient.post('/api/waiting-list', payload).then((res) => res.data);
};

const deleteWaitingList = (id) => {
  if (!isAdmin() && !isReceptionist()) {
    return Promise.reject({ message: 'Unauthorized Access ❌' });
  }

  return axiosClient.delete(`/api/waiting-list/${id}`).then((res) => res.data);
};

const updateWaitingList = (id, payload) => {
  if (!isAdmin() && !isReceptionist() && !isDoctor()) {
    return Promise.reject({ message: 'Unauthorized Access ❌' });
  }

  return axiosClient.patch(`/api/waiting-list/${id}`, payload).then((res) => res.data);
};

const getAllWaitingList = ({
  page = 1,
  limit = 10,
  type,
  search,
  sortBy = 'createdAt',
  order = 'asc',
  status = '',
} = {}) => {
  return axiosClient
    .get('/api/all-watting-list', {
      params: { page, limit, type, search, sortBy, order, status },
    })
    .then((res) => res.data);
};

const getDoctorWaitingList = ({
  doctorId,
  page = 1,
  limit = 10,
  type,
  startDate,
  endDate,
  search,
  sortBy = 'createdAt',
  order = 'asc',
}) => {
  return axiosClient
    .get(`/api/waiting-list/doctor/${doctorId}`, {
      params: {
        page,
        limit,
        type,
        startDate,
        endDate,
        search,
        sortBy,
        order,
      },
    })
    .then((res) => res.data);
};

const waitingListService = {
  addToWaitingList,
  deleteWaitingList,
  updateWaitingList,
  getAllWaitingList,
  getDoctorWaitingList,
};

export default waitingListService;
