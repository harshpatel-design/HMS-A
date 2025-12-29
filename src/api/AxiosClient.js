import axios from "axios";
import config from "../Config";
import { ErrorNotificationMsg } from "../utils/Notifications";

const axiosClient = axios.create({
  baseURL: config.API_URL,
  timeout: 300000,
});

// Attach Token
axiosClient.interceptors.request.use((req) => {
  const token = localStorage.getItem("auth_token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Response Handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 500) ErrorNotificationMsg("Server Error");
      else if ([400, 401, 404].includes(status)) {
        ErrorNotificationMsg(
          data?.message || data?.detail || data?.[0] || "Request Failed"
        );
      }
    }
    return Promise.reject(error);
  }
);

// Request Helpers
export const getRequest = (URL, params) => axiosClient.get(`/${URL}`, { params });
export const postRequest = (URL, payload) => axiosClient.post(`/${URL}`, payload);
export const patchRequest = (URL, payload) => axiosClient.patch(`/${URL}`, payload);
export const deleteRequest = (URL, body) => axiosClient.delete(`/${URL}`, { data: body });

export default axiosClient;
