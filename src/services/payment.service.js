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

const receivePayment = (payload) => {
  return axiosClient.post('/api/receive-payment', payload).then((res) => res.data);
};

const getPatientPaymentHistory = (patientId) => {
  if (!patientId) {
    return Promise.reject({ message: 'Patient ID is required' });
  }

  return axiosClient.get(`/api/patient-payment-history/${patientId}`).then((res) => res.data);
};

const getPatientLedger = ({
  page = 1,
  limit = 10,
  search = '',
  ordering = '-receivedAt',
  startDate = null,
  endDate = null,
  id = null,
}) => {
  return axiosClient
    .get(`/api/patient-ledger`, {
      params: { page, limit, search,id, ordering, startDate, endDate },
    })
    .then((res) => res.data);
};

const paymentService = {
  receivePayment,
  getPatientPaymentHistory,
  getPatientLedger,
};

export default paymentService;
