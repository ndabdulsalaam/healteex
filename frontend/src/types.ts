export type UserRole = "pharmacist" | "policy_maker" | "facility_admin" | "super_admin";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  role: UserRole | null;
  first_name: string;
  last_name: string;
};

export type JwtAuthResponse = {
  access: string;
  refresh: string;
  token_type: "Bearer";
  expires_in: number;
  remember_me: boolean;
  user: AuthUser;
};

export type SignupRequestResponse = {
  detail: string;
  expires_in_minutes: number;
};

export type Facility = {
  id: number;
  name: string;
  code: string;
  facility_type: string;
  ownership: string;
  state: string;
  city: string;
  lga: string;
};

export type Medicine = {
  id: number;
  name: string;
  generic_name: string;
  category: string;
  pack_size: string;
  unit: string;
};

export type InventoryTransaction = {
  id: number;
  facility: number;
  medicine: number;
  transaction_type: string;
  quantity: string;
  batch_number: string;
  source_destination: string;
  occurred_at: string;
  notes: string;
};

export type StockSnapshot = {
  id: number;
  facility: number;
  medicine: number;
  stock_on_hand: string;
  days_of_stock: number;
  recorded_at: string;
};

export type Forecast = {
  id: number;
  facility: number;
  medicine: number;
  forecast_date: string;
  predicted_demand: string;
  confidence_interval_lower: string;
  confidence_interval_upper: string;
};

export type Alert = {
  id: number;
  facility: number;
  medicine: number;
  alert_type: string;
  status: string;
  message: string;
  triggered_at: string;
};

export type DashboardData = {
  facilities: Facility[];
  medicines: Medicine[];
  transactions: InventoryTransaction[];
  stockSnapshots: StockSnapshot[];
  forecasts: Forecast[];
  alerts: Alert[];
};
