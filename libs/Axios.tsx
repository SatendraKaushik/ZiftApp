import axios from "axios";
import { TokenStorage } from './TokenStorage';

const Axios = axios.create({
  baseURL: "http://192.168.3.254:8080/api/v1",
  withCredentials: true,
});

// Add token to requests
Axios.interceptors.request.use(async (config) => {
  const token = await TokenStorage.getToken();
  console.log('Tokenintereptor:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Extract token from cookie
Axios.interceptors.response.use(async (response) => {
  const setCookie = response.headers['set-cookie'];
  if (setCookie) {
    const tokenMatch = setCookie.toString().match(/accessToken=([^;]+)/);
    if (tokenMatch && tokenMatch[1]) {
      await TokenStorage.setToken(tokenMatch[1]);
      console.log('Token saved from cookie:', tokenMatch[1]);
    }
  }
  return response;
});

export default Axios;