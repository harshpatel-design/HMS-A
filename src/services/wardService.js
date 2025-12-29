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

const getWards = ({
  page = 1,
  limit = 10,
  search = "",
  orderBy = "createdAt",
  order = "DESC",
} = {}) => {
  return axiosClient
    .get("api/wards", {
      params: { page, limit, search, orderBy, order },
    })
    .then(res => res.data)
};

const getWardById = (id) => {
  return axiosClient
    .get(`api/wards/${id}`)
    .then((res) => res.data);
};


const createWard = (payload) => {
  if (!isAdmin()) {
    throw new Error("Admin Only Access ❌");
  }

  return axiosClient
    .post("api/create-ward", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.data);
};

const updateWard = (id, payload) => {
  if (!isAdmin()) {
    return Promise.reject({ message: "Admin Only Access ❌" });
  }

  return axiosClient
    .patch(`api/wards/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.data);
};

const deleteWard = (id) => {
  if (!isAdmin()) {
    throw new Error("Admin Only Access ❌");
  }

  return axiosClient
    .delete(`api/wards/${id}`)
    .then((res) => res.data);
};

const wardService = {
  getWards,
  getWardById,
  createWard,
  updateWard,
  deleteWard,
};

export default wardService;
