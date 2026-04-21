import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// This module creates a singleton axios instance.
// Import this instead of raw axios for all API calls.
const BASE = process.env.NEXT_PUBLIC_BASEURL;

const api = axios.create({
    baseURL: BASE ?? "",
    withCredentials: true, // always send cookies (refresh token)
});

// We store a getter that the interceptor can call to get the latest access token.
// This is set up by AuthProvider using setTokenGetter().
let getToken: (() => string | null) | null = null;
let refreshFn: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => string | null) {
    getToken = fn;
}

export function setRefreshFn(fn: () => Promise<string | null>) {
    refreshFn = fn;
}

// ── Request interceptor: attach access token ──────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getToken?.();
    if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

// ── Response interceptor: silent refresh on 401 ───────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
    failedQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    if (originalRequest.headers)
                        originalRequest.headers["Authorization"] = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshFn?.();
                processQueue(null, newToken ?? null);
                if (newToken && originalRequest.headers) {
                    originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                }
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Redirect to login if refresh fails
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;