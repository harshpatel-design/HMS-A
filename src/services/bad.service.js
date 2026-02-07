import axios from 'axios';
import config from '../Config';

const API_URL = config.API_URL;

const axiosClient = axios.create({
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

const getBeds = (params = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    orderBy = 'createdAt',
    order = 'DESC',
    floorId,
    wardId,
    roomId,
    bedType,
    bedLocationType,
    isActive,
    isOccupied,
  } = params;

  const queryParams = {
    page,
    limit,
    sortBy: orderBy,
    sortOrder: order.toLowerCase(),
  };

  if (search) queryParams.search = search;
  if (floorId) queryParams.floorId = floorId;
  if (wardId) queryParams.wardId = wardId;
  if (roomId) queryParams.roomId = roomId;
  if (bedType) queryParams.bedType = bedType;
  if (bedLocationType) queryParams.bedLocationType = bedLocationType;

  if (isActive !== undefined) queryParams.isActive = String(isActive);
  if (isOccupied !== undefined) queryParams.isOccupied = String(isOccupied);

  return axiosClient.get('api/all-bed', { params: queryParams }).then((res) => res.data);
};

const getBedById = (id) => {
  return axiosClient.get(`api/get-bed/${id}`).then((res) => res.data);
};

const createBed = (payload) => {
  if (!isAdmin()) {
    throw new Error('Admin Only Access ❌');
  }

  return axiosClient.post('api/create-bed', payload).then((res) => {
    return res.data;
  });
};
const updateBed = (id, payload) => {
  if (!isAdmin()) {
    return Promise.reject({ message: 'Admin Only Access ❌' });
  }

  return axiosClient.patch(`api/update-bed/${id}`, payload).then((res) => res.data);
};

const deleteBed = (id) => {
  if (!isAdmin()) {
    throw new Error('Admin Only Access ❌');
  }

  return axiosClient.delete(`api/delete-bed/${id}`).then((res) => res.data);
};

const bedService = {
  getBeds,
  getBedById,
  createBed,
  updateBed,
  deleteBed,
};

export default bedService;
