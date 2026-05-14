import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    // baseURL: import.meta.env.VITE_API_BASE_URL || 'https://culturearc.onrender.com/api',
});

// Add a request interceptor to attach the token if it exists
api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user) {
            const token = JSON.parse(user).token;
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
