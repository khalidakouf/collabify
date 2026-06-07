import axios from 'axios';

// تحديد المسار الرئيسي للباكيند ديال Laravel
const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor: كيزيد الـ Token تلقائياً ف أي Request يلا كان مخبي ف الـ LocalStorage
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;