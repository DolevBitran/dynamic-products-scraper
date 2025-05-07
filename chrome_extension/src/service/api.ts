import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3000',
});

// Add a request interceptor to include the token from Chrome storage
API.interceptors.request.use(
    async (config) => {
        return new Promise((resolve) => {
            chrome.storage.local.get(['token'], (result) => {
                if (result.token) {
                    config.headers.Authorization = `Bearer ${result.token}`;
                }
                resolve(config);
            });
        });
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;