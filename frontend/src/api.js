const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");
const endpoints = {
    token: `${API_BASE}/auth/token/`,
    facilities: `${API_BASE}/v1/inventory/facilities/`,
    medicines: `${API_BASE}/v1/inventory/medicines/`,
    transactions: `${API_BASE}/v1/inventory/transactions/`,
    stockSnapshots: `${API_BASE}/v1/inventory/stock-snapshots/`,
    forecasts: `${API_BASE}/v1/inventory/forecasts/`,
    alerts: `${API_BASE}/v1/inventory/alerts/`,
};
async function request(url, token, options = {}) {
    const headers = new Headers(options.headers);
    if (token) {
        headers.set("Authorization", `Token ${token}`);
    }
    if (options.body && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        let detail = "Unable to reach API";
        try {
            const payload = await response.json();
            detail = payload?.detail ?? JSON.stringify(payload);
        }
        catch (error) {
            detail = await response.text();
        }
        throw new Error(detail || response.statusText);
    }
    if (options.skipJson || response.status === 204) {
        return undefined;
    }
    return (await response.json());
}
export async function login(username, password) {
    const payload = await request(endpoints.token, undefined, {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });
    return payload.token;
}
export async function fetchDashboard(token) {
    const [facilities, medicines, transactions, stockSnapshots, forecasts, alerts] = await Promise.all([
        request(endpoints.facilities, token),
        request(endpoints.medicines, token),
        request(endpoints.transactions, token),
        request(endpoints.stockSnapshots, token),
        request(endpoints.forecasts, token),
        request(endpoints.alerts, token),
    ]);
    return { facilities, medicines, transactions, stockSnapshots, forecasts, alerts };
}
export function createFacility(token, payload) {
    return request(endpoints.facilities, token, {
        method: "POST",
        body: JSON.stringify({ ...payload, is_active: true }),
    });
}
export function createTransaction(token, payload) {
    return request(endpoints.transactions, token, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
