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

/**
 * =============================
 * GET ROOMS (LIST)
 * =============================
 */
const getRooms = ({
  page = 1,
  limit = 10,
  search = "",
  orderBy = "createdAt",
  order = "DESC",
} = {}) => {
  return axiosClient
    .get("api/rooms", {
      params: { page, limit, search, orderBy, order },
    })
    .then((res) => res.data);
};


const getRoomById = (id) => {
  return axiosClient
    .get(`api/rooms/${id}`)
    .then((res) => res.data);
};

const createRoom = (payload) => {
  if (!isAdmin()) {
    throw new Error("Admin Only Access ❌");
  }

  return axiosClient
    .post("api/create-room", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.data);
};


const updateRoom = (id, payload) => {
  if (!isAdmin()) {
    return Promise.reject({ message: "Admin Only Access ❌" });
  }

  return axiosClient
    .patch(`api/rooms/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.data);
};

const deleteRoom = (id) => {
  if (!isAdmin()) {
    throw new Error("Admin Only Access ❌");
  }

  return axiosClient
    .delete(`api/rooms/${id}`)
    .then((res) => res.data);
};

const roomService = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};

export default roomService;
