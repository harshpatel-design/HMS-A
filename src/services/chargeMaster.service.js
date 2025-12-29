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
const isAccountant = () => getRole() === "accountant";

const getUserId = () => JSON.parse(localStorage.getItem("user"))?.id;

const getChargeMasters = (params = {}) => {
  const {
    page = 1,
    limit = 20,
    search,
    ordering = "-createdAt",
    chargeType,
  } = params;

  const queryParams = {
    page,
    limit,
    search,
    ordering,
    ...(chargeType && { chargeType }),
  };

  return axiosClient
    .get("api/charge-masters", { params: queryParams })
    .then((res) => res.data);
};

const getChargeMasterById = (id) => {
  return axiosClient.get(`api/charge-masters/${id}`).then((res) => res.data);
};

const createChargeMaster = (payload) => {
  if (!isAdmin() && !isAccountant()) {
    throw new Error("Admin/Accountant Only Access ❌");
  }

  const userId = getUserId();
  const finalPayload = {
    ...payload,
    createdBy: userId,
  };

  return axiosClient
    .post("api/charge-masters", finalPayload)
    .then((res) => res.data);
};

const updateChargeMaster = (id, payload) => {
  if (!isAdmin() && !isAccountant()) {
    return Promise.reject({ message: "Admin/Accountant Only Access ❌" });
  }

  const userId = getUserId();
  const finalPayload = {
    ...payload,
    updatedBy: userId,
  };

  return axiosClient
    .patch(`api/charge-masters/${id}`, finalPayload)
    .then((res) => res.data);
};

const deleteChargeMaster = (id) => {
  if (!isAdmin()) {
    throw new Error("Admin Only Access ❌");
  }

  return axiosClient.delete(`api/charge-masters/${id}`).then((res) => res.data);
};

const chargeMasterService = {
  getChargeMasters,
  getChargeMasterById,
  createChargeMaster,
  updateChargeMaster,
  deleteChargeMaster,
};

export default chargeMasterService;
