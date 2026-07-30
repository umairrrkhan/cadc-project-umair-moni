import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL || 'http://localhost:8080/api',
    timeout: 125000,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) =>{
        console.error('Request interceptor error:', error);
        return Promise.reject(error)
    } 
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            return Promise.reject({ message: 'Request timeout. Server too slow.' });
        }
        if (!error.response) {
            return Promise.reject({ message: 'Network error. Check backend.' });
        }
        if (error.response.status === 401 && !error.config?.url?.includes('/auth/login')) {
            localStorage.removeItem('token');
        }
        const message = error.response.data?.error || error.response.data || 'Something went wrong';
        return Promise.reject({ message, status: error.response.status });
    }
);

export default api;
