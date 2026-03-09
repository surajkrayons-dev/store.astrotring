
import axios from "axios";

export const api = axios.create({
  baseURL: "https://astro.astrotring.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers["Content-Type"] = "multipart/form-data";
  }

  return config;
});