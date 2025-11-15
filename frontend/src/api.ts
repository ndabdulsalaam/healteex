import type {
  Alert,
  DashboardData,
  Facility,
  InventoryTransaction,
  Medicine,
  Forecast,
  StockSnapshot,
  JwtAuthResponse,
  SignupRequestResponse,
  UserRole,
} from "./types";

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
} as const;

type RequestOptions = RequestInit & {
  token?: string;
  authScheme?: "Bearer" | "Token";
  skipJson?: boolean;
};

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
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
    } catch {
      detail = await response.text();
    }
    throw new Error(detail || response.statusText);
  }

  if (skipJson || response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export type SignupRequestPayload = {
  email: string;
  role: UserRole;
};

export function requestSignup(payload: SignupRequestPayload) {
  return request<SignupRequestResponse>(endpoints.signupRequest, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type SignupVerifyPayload = {
  token: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  remember_me?: boolean;
};

export function verifySignup(payload: SignupVerifyPayload) {
  return request<JwtAuthResponse>(endpoints.signupVerify, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type LoginPayload = {
  email?: string;
  role?: UserRole;
  password: string;
  remember_me?: boolean;
};

export function loginWithEmail(payload: LoginPayload) {
  return request<JwtAuthResponse>(endpoints.jwtCreate, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type RefreshPayload = {
  refresh: string;
};

export function refreshSession(payload: RefreshPayload) {
  return request<Pick<JwtAuthResponse, "access" | "token_type" | "expires_in">>(endpoints.jwtRefresh, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type GoogleSignInPayload = {
  id_token: string;
  role?: UserRole;
  remember_me?: boolean;
};

export function googleSignIn(payload: GoogleSignInPayload) {
  return request<JwtAuthResponse>(endpoints.googleSignIn, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchDashboard(token: string): Promise<DashboardData> {
  const authOptions = { token };
  const [facilities, medicines, transactions, stockSnapshots, forecasts, alerts] = await Promise.all([
    request<Facility[]>(endpoints.facilities, authOptions),
    request<Medicine[]>(endpoints.medicines, authOptions),
    request<InventoryTransaction[]>(endpoints.transactions, authOptions),
    request<StockSnapshot[]>(endpoints.stockSnapshots, authOptions),
    request<Forecast[]>(endpoints.forecasts, authOptions),
    request<Alert[]>(endpoints.alerts, authOptions),
  ]);

  return { facilities, medicines, transactions, stockSnapshots, forecasts, alerts };
}

type FacilityPayload = Pick<Facility, "name" | "code" | "facility_type" | "ownership" | "state" | "city" | "lga"> & {
  address?: string;
  contact_email?: string;
  contact_phone?: string;
};

export function createFacility(token: string, payload: FacilityPayload) {
  return request<Facility>(endpoints.facilities, {
    method: "POST",
    token,
    body: JSON.stringify({ ...payload, is_active: true }),
  });
}

type TransactionPayload = Pick<
  InventoryTransaction,
  "facility" | "medicine" | "transaction_type" | "quantity" | "source_destination" | "notes"
> & {
  occurred_at: string;
  batch_number?: string;
};

export function createTransaction(token: string, payload: TransactionPayload) {
  return request<InventoryTransaction>(endpoints.transactions, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}
