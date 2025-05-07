import axios from 'axios';

// Create an axios instance with base URL and default headers
const API = axios.create({
  baseURL: 'http://localhost:3000/api', // Adjust this to your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
