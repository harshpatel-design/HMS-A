import axios from "axios";
import config from "../Config";

const API_URL = config.API_URL;
const axiosClient = axios.create();
axiosClient.defaults.baseURL = API_URL;

axiosClient.interceptors.request.use((req) => {
    if (
        req.url.includes("reset-password")
    ) {
        return req;
    }
    const token = localStorage.getItem("auth_token");
    if (token) req.headers.Authorization = `Bearer ${token}`;

    return req;
});


const login = ({ email, password }) => {
    return axiosClient
        .post("/api/auth/login", { email, password })
        .then((response) => {
            const data = response.data || {};
            const token = data.token || data.accessToken || null;

            if (token) localStorage.setItem("auth_token", token);
            if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

            return { ...data, token };
        })
        .catch((err) => err.response?.data || { message: "Login Failed" });
};

const logout = async () => {
    try {
        await axiosClient.post("/api/auth/logout");
    } catch (_) { }

    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
};

const getProfile = async () => {
    return axiosClient.get("/api/auth/me")
        .then((res) => res.data?.user)
        .catch((err) => err.response?.data || "Failed to load profile");
};

const uploadImage = async (formData) => {
    return axiosClient.post("/api/auth/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })
        .then((res) => res.data?.data)
        .catch((err) => err.response?.data || "Upload failed");
};

const forgotPassword = async (email) => {
    return axiosClient
        .post("/api/auth/forgot-password", { email })
        .then((res) => res.data)
        .catch((err) => err.response?.data || { message: "Failed to send reset link" });
};

const resetPassword = async (token, password) => {
    return axiosClient.post("/api/auth/reset-password", {
        token,
        password
    });
};

const authService = {
    login,
    logout,
    getProfile,
    uploadImage,
    forgotPassword,
    resetPassword,

};
export default authService;

