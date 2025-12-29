import axios from "axios";
import config from "../Config";

const API_URL = config.API_URL;

const axiosClient = axios.create({
    baseURL: API_URL,
});

// 🔥 Attach token for all requests
axiosClient.interceptors.request.use((req) => {
    const token = localStorage.getItem("auth_token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

// USER ROLE CHECK
const getRole = () => JSON.parse(localStorage.getItem("user"))?.role;
const isAdmin = () => getRole() === "admin";

/* =======================================================
📌 1. GET RECIPIENTS LIST (Pagination, Search)
======================================================= */
const getRecipients = ({ page = 1, limit = 10, orderBy = "createdAt", order = "DESC", search = "" }) => {
    return axiosClient
        .get("api/recipients/recipients", {
            params: { page, limit, orderBy, order, search }
        })
        .then(res => res.data)
        .catch(err => err.response?.data || { message: "Failed to fetch recipients" });
};

/* =======================================================
📌 2. GET RECIPIENT BY ID
======================================================= */
const getRecipientById = (id) => {
    return axiosClient
        .get(`api/recipients/recipients/${id}`)
        .then(res => res.data)
        .catch(err => err.response?.data || { message: "Recipient not found" });
};

/* =======================================================
📌 3. CREATE RECIPIENT (ADMIN ONLY)
======================================================= */
const createRecipient = (payload) => {
    if (!isAdmin()) return Promise.reject({ message: "Admin Only Access ❌" });

    return axiosClient
        .post("api/recipients/create-recipient", payload)
        .then(res => res.data)
        .catch(err => err.response?.data || { message: "Create Failed" });
};

/* =======================================================
📌 4. UPDATE RECIPIENT (ADMIN ONLY)
======================================================= */
const updateRecipient = (id, payload) => {
    if (!isAdmin()) return Promise.reject({ message: "Admin Only Access ❌" });

    return axiosClient
        .patch(`api/recipients/recipients/${id}`, payload)
        .then(res => res.data)
        .catch(err => err.response?.data || { message: "Update Failed" });
};

/* =======================================================
📌 5. DELETE RECIPIENT (ADMIN ONLY)
======================================================= */
const deleteRecipient = (id) => {
    if (!isAdmin()) return Promise.reject({ message: "Admin Only Access ❌" });

    return axiosClient
        .delete(`api/recipients/recipients/${id}`)
        .then(res => res.data)
        .catch(err => err.response?.data || { message: "Delete Failed" });
};

/* EXPORT LIKE doctorService */
const recipientService = {
    getRecipients,
    getRecipientById,
    createRecipient,
    updateRecipient,
    deleteRecipient
};

export default recipientService;
