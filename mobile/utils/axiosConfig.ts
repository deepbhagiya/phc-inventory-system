import axios from 'axios';
import { getItemAsync } from './storage';

// Replace with your production URL once deployed (e.g., https://phc-inventory-api.onrender.com)
const BASE_URL = 'http://10.147.67.222:5000';

const api = axios.create({
  baseURL: BASE_URL,
});


api.interceptors.request.use(async (config) => {
  const token = await getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
