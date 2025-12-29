import axios from "axios";
import config from "../Config";

const API_URL = config.API_URL;
const axiosClient = axios.create({
  baseURL: API_URL,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const getDepartments = async (params = {}) => {
  const { search = "", sort = "asc" } = params;

  try {
    const response = await axiosClient.get("/api/departments", {
      params: { search, sort },
    });

    return {
      success: response.data?.success ?? true,
      departments: response.data?.departments || response.data?.data || [],
      count: response.data?.count || 0,
    };
  } catch (err) {
    return {
      success: false,
      departments: [],
      message: err.response?.data?.message || "Failed to fetch departments",
    };
  }
};

export default getDepartments;
