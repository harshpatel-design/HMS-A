import axios from "axios";
import config from "../Config";

const API_URL = config.API_URL;
const axiosClient = axios.create();
axiosClient.defaults.baseURL = API_URL;

/* ========================= SET AUTH HEADER AUTOMATIC ========================= */
axiosClient.interceptors.request.use((req) => {
    if (
        req.url.includes("reset-password") ||
        req.url.includes("forgot-password")
    ) {
        return req; // skip token
    }
    const token = localStorage.getItem("auth_token");
    if (token) req.headers.Authorization = `Bearer ${token}`;

    return req;
});


/* ========================= LOGIN ========================= */
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

/* ========================= LOGOUT ========================= */
const logout = async () => {
    try {
        await axiosClient.post("/api/auth/logout");
    } catch (_) { }

    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
};

/* ========================= GET PROFILE ========================= */
const getProfile = async () => {
    return axiosClient.get("/api/auth/me")
        .then((res) => res.data?.user)
        .catch((err) => err.response?.data || "Failed to load profile");
};

/* ========================= UPLOAD PROFILE IMAGE ========================= */
const uploadImage = async (formData) => {
    return axiosClient.post("/api/auth/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })
        .then((res) => res.data?.data) // updated user returned from backend
        .catch((err) => err.response?.data || "Upload failed");
};


/* ========================= FORGOT PASSWORD ========================= */
const forgotPassword = async (email) => {
    return axiosClient
        .post("/api/auth/forgot-password", { email })
        .then((res) => res.data)
        .catch((err) => err.response?.data || { message: "Failed to send reset link" });
};

/* ========================= RESET PASSWORD ========================= */
const resetPassword = async (token, password) => {
    return axios.post(`${API_URL}/api/auth/reset-password`, {
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
