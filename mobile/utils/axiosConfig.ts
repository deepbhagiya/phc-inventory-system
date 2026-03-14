import axios from 'axios';
import { getItemAsync } from './storage';

// Live Production URL on Render
const BASE_URL = 'https://phc-inventory-system.onrender.com';

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
