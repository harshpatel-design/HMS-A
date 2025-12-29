import axios from "axios";
import config from "../Config";

const API_URL = config.API_URL;
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((req) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

const getRole = () => JSON.parse(localStorage.getItem("user"))?.role;
const isAdmin = () => getRole() === "admin";
const isDoctor = () => getRole() === "doctor";

const getUserId = () => JSON.parse(localStorage.getItem("user"))?.id;

const getLabTests = (params = {}) => {
  const { page = 1, limit = 20, search, ordering = "-createdAt" } = params;
  const queryParams = {
    page,
    limit,
    search,
    ordering,
  };
  return axiosClient
    .get("api/lab-tests", { params: queryParams })
    .then((res) => res.data);
};

const getLabTestById = (id) => {
  return axiosClient.get(`api/lab-tests/${id}`).then((res) => res.data);
};

const createLabTest = (payload) => {
  if (!isAdmin() || isDoctor()) {
    throw new Error("Admin Only Access ❌");
  }

  const userId = getUserId();
  const finalPayload = {
    ...payload,
    createdBy: userId,
  };
  return axiosClient
    .post("api/lab-tests", finalPayload)
    .then((res) => res.data);
};

const updateLabTest = (id, payload) => {
  if (!isAdmin() || isDoctor()) {
    return Promise.reject({ message: "Admin Only Access ❌" });
  }

  const userId = getUserId();
  const finalPayload = {
    ...payload,
    updatedBy: userId,
  };
  return axiosClient
    .patch(`api/lab-tests/${id}`, finalPayload)
    .then((res) => res.data);
};

const deleteLabTest = (id) => {
  if (!isAdmin() || isDoctor()) {
    throw new Error("Admin Only Access ❌");
  }
  return axiosClient.delete(`api/lab-tests/${id}`).then((res) => res.data);
};

const labTestService = {
  getLabTests,
  getLabTestById,
  createLabTest,
  updateLabTest,
  deleteLabTest,
};

export default labTestService;
