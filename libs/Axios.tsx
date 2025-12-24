import axios from "axios";
import { TokenStorage } from './TokenStorage';

const Axios = axios.create({
  baseURL: "http://192.168.0.106:8080/api/v1",
  withCredentials: true,
});

// Add token to requests
Axios.interceptors.request.use(async (config) => {
  const token = await TokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default Axios;