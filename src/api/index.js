import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to handle errors (optional)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data?.msg || error.message);
        return Promise.reject(error);
    }
);

export default API;
