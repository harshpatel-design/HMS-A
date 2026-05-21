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

const getFloors = ({
  page = 1,
  limit = 10,
  search = "",
  orderBy = "createdAt",
  order = "DESC",
} = {}) => {
  return axiosClient
    .get("api/floors", {
      params: { page, limit, search, orderBy, order },
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw console.log(err);
    });
};

const getFloorById = (id) => {
  return axiosClient
    .get(`api/floors/${id}`)
    .then((res) => res.data);
};
const createFloor = (payload) => {
  if (!isAdmin()) {
    throw new Error("Admin Only Access ❌");
  }

  return axiosClient
    .post("api/create-floors", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.data);
};

const updateFloor = (id, payload) => {
  if (!isAdmin()) {
    return Promise.reject({ message: "Admin Only Access ❌" });
  }

  return axiosClient
    .patch(`api/floors/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.data);
};

const deleteFloor = (id) => {
  if (!isAdmin()) {
    throw new Error("Admin Only Access ❌");
  }

  return axiosClient
    .delete(`api/floors/${id}`)
    .then((res) => res.data);
};

const floorService = {
  getFloors,
  getFloorById,
  createFloor,
  updateFloor,
  deleteFloor,
};

export default floorService;
