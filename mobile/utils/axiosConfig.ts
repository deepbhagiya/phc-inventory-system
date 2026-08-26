import axios from 'axios';
import { getItemAsync } from './storage';

// Local Development URL (pointing to emulator host loopback)
const BASE_URL = 'http://10.0.2.2:5000';

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
