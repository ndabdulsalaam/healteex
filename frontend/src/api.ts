import type { Alert, DashboardData, Facility, InventoryTransaction, Medicine, Forecast, StockSnapshot } from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");

const endpoints = {
  token: `${API_BASE}/auth/token/`,
  facilities: `${API_BASE}/v1/inventory/facilities/`,
  medicines: `${API_BASE}/v1/inventory/medicines/`,
  transactions: `${API_BASE}/v1/inventory/transactions/`,
  stockSnapshots: `${API_BASE}/v1/inventory/stock-snapshots/`,
  forecasts: `${API_BASE}/v1/inventory/forecasts/`,
  alerts: `${API_BASE}/v1/inventory/alerts/`,
} as const;

type RequestOptions = RequestInit & { skipJson?: boolean };

async function request<T>(url: string, token?: string, options: RequestOptions = {}): Promise<T> {
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
    } catch (error) {
      detail = await response.text();
    }
    throw new Error(detail || response.statusText);
  }

  if (options.skipJson || response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function login(username: string, password: string): Promise<string> {
  const payload = await request<{ token: string }>(endpoints.token, undefined, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return payload.token;
}

export async function fetchDashboard(token: string): Promise<DashboardData> {
  const [facilities, medicines, transactions, stockSnapshots, forecasts, alerts] = await Promise.all([
    request<Facility[]>(endpoints.facilities, token),
    request<Medicine[]>(endpoints.medicines, token),
    request<InventoryTransaction[]>(endpoints.transactions, token),
    request<StockSnapshot[]>(endpoints.stockSnapshots, token),
    request<Forecast[]>(endpoints.forecasts, token),
    request<Alert[]>(endpoints.alerts, token),
  ]);

  return { facilities, medicines, transactions, stockSnapshots, forecasts, alerts };
}

type FacilityPayload = Pick<Facility, "name" | "code" | "facility_type" | "ownership" | "state" | "city" | "lga"> & {
  address?: string;
  contact_email?: string;
  contact_phone?: string;
};

export function createFacility(token: string, payload: FacilityPayload) {
  return request<Facility>(endpoints.facilities, token, {
    method: "POST",
    body: JSON.stringify({ ...payload, is_active: true }),
  });
}

type TransactionPayload = Pick<InventoryTransaction, "facility" | "medicine" | "transaction_type" | "quantity" | "source_destination" | "notes"> & {
  occurred_at: string;
  batch_number?: string;
};

export function createTransaction(token: string, payload: TransactionPayload) {
  return request<InventoryTransaction>(endpoints.transactions, token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
