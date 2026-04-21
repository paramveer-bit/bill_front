// useApi.ts
// Use this hook to get the pre-configured axios instance in any component.
// The instance automatically attaches the Authorization header and handles
// silent token refresh on 401 responses.
//
// Usage:
//   const api = useApi();
//   const data = await api.get("/api/bills");

import api from "@/lib/api";

export function useApi() {
    // The axios instance is a module-level singleton; wiring of the token getter
    // and refresh function is done once in AuthProvider on mount.
    return api;
}