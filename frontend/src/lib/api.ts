import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import {
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
} from './auth';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

interface RefreshResponse {
    access: string;
    refresh?: string;
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken();

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequestConfig;

        if (!originalRequest || error.response?.status !== 401) {
            return Promise.reject(error);
        }

        const requestUrl = originalRequest.url || '';

        if (
            requestUrl.includes('/auth/login/') ||
            requestUrl.includes('/auth/refresh/')
        ) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            clearTokens();

            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }

            return Promise.reject(error);
        }

        originalRequest._retry = true;

        const refreshToken = getRefreshToken();

        if (!refreshToken) {
            clearTokens();

            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }

            return Promise.reject(error);
        }

        try {
            const response = await axios.post<RefreshResponse>(
                `${api.defaults.baseURL}/auth/refresh/`,
                {
                    refresh: refreshToken,
                },
            );

            const newAccessToken = response.data.access;

            const newRefreshToken = response.data.refresh || refreshToken;

            setTokens(newAccessToken, newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            clearTokens();

            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }

            return Promise.reject(refreshError);
        }
    },
);

export default api;
