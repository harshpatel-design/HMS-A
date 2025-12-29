import axios from "axios";
import config from "../Config";

const API_URL = config.API_URL;

const axiosClient = axios.create({
    baseURL: API_URL,
});

/* ---------------------- TOKEN INTERCEPTOR ---------------------- */
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

const getServiceNames = async () => {
    try {
        const response = await axiosClient.get("/api/servicenames");
        return response.data;
    } catch (err) {
        return err.response?.data || {
            success: false,
            serviceNames: [],
            message: "Failed to load service names",
        };
    }
};

export default { getServiceNames };
