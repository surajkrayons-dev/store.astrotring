import axios from "axios";

export const api = axios.create({
  baseURL: "http://backend.astrotring.shop/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Only set Content-Type if not already defined
    if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "multipart/form-data";
    }
  }

  return config;
});