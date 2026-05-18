import axios from 'axios';
import config from '../Config';

const axiosClient = axios.create({
  baseURL: config.API_URL,
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
export const getDashBoardCount = async ({ startDate, endDate } = {}) => {
  if (!isAdmin()) {
    throw new Error('Unauthorized');
  }
  const params = {};
  if (startDate) {
    params.startDate = startDate;
  }
  if (endDate) {
    params.endDate = endDate;
  }
  const response = await axiosClient.get('/api/count', {
    params,
  });

  return response.data;
};
