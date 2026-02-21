import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta?.env?.VITE_API_URL?.replace(/\/$/, "") || "/api";

const api: AxiosInstance = axios.create({
    baseURL
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Se o corpo for FormData, deixa o navegador definir o Content-Type (com boundary)
    if (config.data instanceof FormData) {
        if (config.headers && config.headers['Content-Type']) {
            delete config.headers['Content-Type'];
        }
    } else {
        // Para JSON, garante o header adequado
        config.headers = { ...(config.headers || {}), 'Content-Type': 'application/json' };
    }
    return config;
});

export default api;

