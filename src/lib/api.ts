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
let refreshPromise: Promise<string | null> | null = null;
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

        // Only handle 401 errors, and only retry once per request
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // If already refreshing, wait for that refresh to complete
            if (isRefreshing && refreshPromise) {
                return refreshPromise
                    .then((token) => {
                        if (!token) {
                            return Promise.reject(new Error("Token refresh failed"));
                        }
                        if (originalRequest.headers) {
                            originalRequest.headers["Authorization"] = `Bearer ${token}`;
                        }
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            // Start new refresh
            isRefreshing = true;
            refreshPromise = (async () => {
                try {
                    const newToken = await refreshFn?.();

                    if (!newToken) {
                        processQueue(new Error("Token refresh returned null"), null);

                        throw new Error("Token refresh returned null");
                    }

                    processQueue(null, newToken);

                    if (originalRequest.headers) {
                        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                    }

                    return newToken;
                } catch (refreshError) {
                    processQueue(refreshError, null);

                    throw refreshError;
                } finally {
                    isRefreshing = false;
                    refreshPromise = null;
                }
            })();

            return refreshPromise
                .then((token) => {
                    if (!token) {
                        return Promise.reject(new Error("Token refresh failed"));
                    }
                    if (originalRequest.headers) {
                        originalRequest.headers["Authorization"] = `Bearer ${token}`;
                    }
                    return api(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        return Promise.reject(error);
    }
);

export default api;