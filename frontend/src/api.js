const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");
const endpoints = {
    jwtCreate: `${API_BASE}/auth/jwt/create/`,
    jwtRefresh: `${API_BASE}/auth/jwt/refresh/`,
    jwtVerify: `${API_BASE}/auth/jwt/verify/`,
    googleSignIn: `${API_BASE}/auth/google/`,
    signupRequest: `${API_BASE}/v1/accounts/signup/request/`,
    signupVerify: `${API_BASE}/v1/accounts/signup/verify/`,
    facilities: `${API_BASE}/v1/inventory/facilities/`,
    medicines: `${API_BASE}/v1/inventory/medicines/`,
    transactions: `${API_BASE}/v1/inventory/transactions/`,
    stockSnapshots: `${API_BASE}/v1/inventory/stock-snapshots/`,
    forecasts: `${API_BASE}/v1/inventory/forecasts/`,
    alerts: `${API_BASE}/v1/inventory/alerts/`,
};
async function request(url, options = {}) {
    const { token, authScheme = "Bearer", skipJson, ...fetchOptions } = options;
    const headers = new Headers(fetchOptions.headers);
    if (token) {
        headers.set("Authorization", `${authScheme} ${token}`);
    }
    if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }
    const response = await fetch(url, { ...fetchOptions, headers });
    if (!response.ok) {
        let detail = "Unable to reach API";
        try {
            const payload = await response.json();
            detail = payload?.detail ?? JSON.stringify(payload);
        }
        catch {
            detail = await response.text();
        }
        throw new Error(detail || response.statusText);
    }
    if (skipJson || response.status === 204) {
        return undefined;
    }
    return (await response.json());
}
export function requestSignup(payload) {
    return request(endpoints.signupRequest, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
export function verifySignup(payload) {
    return request(endpoints.signupVerify, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
export function loginWithEmail(payload) {
    return request(endpoints.jwtCreate, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
export function refreshSession(payload) {
    return request(endpoints.jwtRefresh, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
export function googleSignIn(payload) {
    return request(endpoints.googleSignIn, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
export async function fetchDashboard(token) {
    const authOptions = { token };
    const [facilities, medicines, transactions, stockSnapshots, forecasts, alerts] = await Promise.all([
        request(endpoints.facilities, authOptions),
        request(endpoints.medicines, authOptions),
        request(endpoints.transactions, authOptions),
        request(endpoints.stockSnapshots, authOptions),
        request(endpoints.forecasts, authOptions),
        request(endpoints.alerts, authOptions),
    ]);
    return { facilities, medicines, transactions, stockSnapshots, forecasts, alerts };
}
export function createFacility(token, payload) {
    return request(endpoints.facilities, {
        method: "POST",
        token,
        body: JSON.stringify({ ...payload, is_active: true }),
    });
}
export function createTransaction(token, payload) {
    return request(endpoints.transactions, {
        method: "POST",
        token,
        body: JSON.stringify(payload),
    });
}
