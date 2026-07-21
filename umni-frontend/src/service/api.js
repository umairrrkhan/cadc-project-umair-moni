import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL || 'http://localhost:8080/api',
    timeout: 5000, 
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log(' Token from localStorage:', token ? 'EXISTS' : ' MISSING');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Request headers:', config.headers);
        }else {
            console.log('No token found!');
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
        const message = error.response.data?.error || error.response.data || 'Something went wrong';
        return Promise.reject({ message });
    }
);

export default api;