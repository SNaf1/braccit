import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to add the token
instance.interceptors.request.use(
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

// Add a response interceptor to handle errors
instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is unauthorized and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const response = await instance.post('/api/auth/refresh-token');
                const { token } = response.data;

                if (token) {
                    // Update token in localStorage and axios headers
                    localStorage.setItem('token', token);
                    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // Retry the original request
                    return instance(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, clear auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Don't redirect, let the component handle the error
            }
        }

        return Promise.reject(error);
    }
);

export default instance;
