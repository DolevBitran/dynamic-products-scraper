import axios from 'axios';

const API_URL = 'http://localhost:3000/';

const API = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue: { resolve: Function; reject: Function }[] = [];

// Process the queue of failed requests
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Add a request interceptor to include the auth token in requests
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 errors and refresh token
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is not 401 or request has already been retried, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject({ ...error, message: error.response?.data.error || error.message });
        }

        // Mark this request as retried to prevent infinite loops
        originalRequest._retry = true;

        // If we're already refreshing, add this request to the queue
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(token => {
                    if (token) {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    }
                    return API(originalRequest);
                })
                .catch(err => Promise.reject(err));
        }
        isRefreshing = true;

        try {
            // Get refresh token from storage
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                // No refresh token, clear auth and reject
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                processQueue(new Error('No refresh token available'));
                return Promise.reject(error);
            }

            // Call refresh token endpoint
            const response = await axios.post(`${API_URL}auth/refresh-token`, { refreshToken });

            if (response.data.success) {
                // Store new tokens
                const { accessToken, refreshToken: newRefreshToken } = response.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Update authorization header
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                // Process queue with new token
                processQueue(null, accessToken);

                return API(originalRequest);
            } else {
                // Refresh failed, clear auth and reject
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                processQueue(new Error('Failed to refresh token'));
                return Promise.reject(error);
            }
        } catch (refreshError) {
            // Error during refresh, clear auth and reject
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            processQueue(refreshError);
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default API;
