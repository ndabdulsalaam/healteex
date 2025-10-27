import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./App.module.css";
import { createFacility, createTransaction, fetchDashboard, login } from "./api";
import type { Alert, DashboardData, Facility, InventoryTransaction, Medicine } from "./types";

const FACILITY_INITIAL_STATE = {
  name: "",
  code: "",
  facility_type: "hospital",
  ownership: "public",
  state: "",
  city: "",
  lga: "",
  address: "",
};

const TRANSACTION_INITIAL_STATE = {
  facility: "",
  medicine: "",
  transaction_type: "receipt",
  quantity: "",
  source_destination: "",
  notes: "",
  occurred_at: new Date().toISOString().slice(0, 16),
  batch_number: "",
};

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("healteex-token"));
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [facilityForm, setFacilityForm] = useState(FACILITY_INITIAL_STATE);
  const [transactionForm, setTransactionForm] = useState(TRANSACTION_INITIAL_STATE);

  const facilityMap = useMemo(() => {
    const entries = new Map<number, Facility>();
    dashboard?.facilities.forEach((facility) => entries.set(facility.id, facility));
    return entries;
  }, [dashboard]);

  const medicineMap = useMemo(() => {
    const entries = new Map<number, Medicine>();
    dashboard?.medicines.forEach((medicine) => entries.set(medicine.id, medicine));
    return entries;
  }, [dashboard]);

  const loadDashboard = useCallback(
    async (authToken: string) => {
      setLoading(true);
      try {
        const next = await fetchDashboard(authToken);
        setDashboard(next);
        setStatusMessage(null);
      } catch (error) {
        const detail = error instanceof Error ? error.message : "Unable to fetch data";
        setStatusMessage(detail);
        if (detail.toLowerCase().includes("authentication")) {
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem("healteex-token", token);
      void loadDashboard(token);
    } else {
      localStorage.removeItem("healteex-token");
      setDashboard(null);
    }
  }, [token, loadDashboard]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const authToken = await login(credentials.username, credentials.password);
      setToken(authToken);
      setStatusMessage("Authentication successful. Loading data...");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Login failed";
      setStatusMessage(detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setFacilityForm(FACILITY_INITIAL_STATE);
    setTransactionForm({ ...TRANSACTION_INITIAL_STATE, occurred_at: new Date().toISOString().slice(0, 16) });
    setCredentials({ username: "", password: "" });
  };

  const handleFacilitySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      await createFacility(token, facilityForm);
      setFacilityForm(FACILITY_INITIAL_STATE);
      setStatusMessage("Facility created");
      await loadDashboard(token);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unable to create facility";
      setStatusMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      await createTransaction(token, {
        facility: Number(transactionForm.facility),
        medicine: Number(transactionForm.medicine),
        transaction_type: transactionForm.transaction_type,
        quantity: transactionForm.quantity || "0",
        source_destination: transactionForm.source_destination,
        notes: transactionForm.notes,
        batch_number: transactionForm.batch_number || undefined,
        occurred_at: new Date(transactionForm.occurred_at).toISOString(),
      });
      setTransactionForm({ ...TRANSACTION_INITIAL_STATE, occurred_at: new Date().toISOString().slice(0, 16) });
      setStatusMessage("Transaction recorded");
      await loadDashboard(token);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unable to create transaction";
      setStatusMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  const totalStock = useMemo(() => {
    if (!dashboard) return 0;
    return dashboard.stockSnapshots.reduce((sum, snapshot) => sum + Number(snapshot.stock_on_hand), 0);
  }, [dashboard]);

  const openAlerts = useMemo(() => dashboard?.alerts.filter((alert) => alert.status === "open").length ?? 0, [dashboard]);

  if (!token) {
    return (
      <div className={styles.appShell}>
        <section className={styles.authWrapper}>
          <header className={styles.authHeader}>
            <h1>Healteex Control Center</h1>
            <p>Use any seeded credentials (e.g. username "superadmin") with the password "ChangeMe123!".</p>
          </header>
          <form className={styles.loginCard} onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                className={styles.textInput}
                value={credentials.username}
                onChange={(event) => setCredentials({ ...credentials, username: event.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className={styles.textInput}
                value={credentials.password}
                onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
                required
              />
            </div>
            <button className={styles.primaryButton} type="submit" disabled={loading}>
              {loading ? "Authenticating..." : "Sign in"}
            </button>
            {statusMessage ? <p className={styles.statusMessage}>{statusMessage}</p> : null}
          </form>
        </section>
      </div>
    );
  }

  const facilities = dashboard?.facilities ?? [];
  const medicines = dashboard?.medicines ?? [];
  const transactions = dashboard ? dashboard.transactions.slice(0, 8) : [];
  const alerts = dashboard?.alerts ?? [];

  const formatDateTime = (value: string) => new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

  return (
    <div className={styles.appShell}>
      <div className={styles.dashboardShell}>
        <header className={styles.dashboardHeader}>
          <div className={styles.titleBlock}>
            <h1>Inventory Overview</h1>
            <p>Authenticated via token. Connected to Django REST API.</p>
          </div>
          <div className={styles.actionsRow}>
            <button className={styles.secondaryButton} type="button" onClick={() => token && loadDashboard(token)} disabled={loading}>
              Refresh
            </button>
            <button className={styles.secondaryButton} type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </header>

        <section className={styles.summaryGrid}>
          <article className={styles.summaryCard}>
            <h2>Facilities</h2>
            <p>{facilities.length}</p>
          </article>
          <article className={styles.summaryCard}>
            <h2>Medicines tracked</h2>
            <p>{medicines.length}</p>
          </article>
          <article className={styles.summaryCard}>
            <h2>Open alerts</h2>
            <p>{openAlerts}</p>
          </article>
          <article className={styles.summaryCard}>
            <h2>National stock on hand</h2>
            <p>{totalStock.toLocaleString()}</p>
          </article>
        </section>

        {statusMessage ? <p className={styles.statusMessage}>{statusMessage}</p> : null}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Key facilities</h2>
            <p className={styles.inlineHelp}>Latest entries from the facility API.</p>
          </div>
          {facilities.length ? (
            <div className={styles.listGrid}>
              {facilities.slice(0, 4).map((facility) => (
                <article key={facility.id} className={styles.card}>
                  <p className={styles.cardTitle}>{facility.name}</p>
                  <span className={styles.pill}>{facility.facility_type}</span>
                  <p>{facility.city}, {facility.state}</p>
                  <p>Code: {facility.code}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>No facilities yet.</div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Recent transactions</h2>
            <p className={styles.inlineHelp}>Syncs straight from the `/transactions/` endpoint.</p>
          </div>
          {transactions.length ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Facility</th>
                    <th>Medicine</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Occurred at</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction: InventoryTransaction) => (
                    <tr key={transaction.id}>
                      <td>{facilityMap.get(transaction.facility)?.name ?? transaction.facility}</td>
                      <td>{medicineMap.get(transaction.medicine)?.name ?? transaction.medicine}</td>
                      <td>{transaction.transaction_type}</td>
                      <td>{transaction.quantity}</td>
                      <td>{formatDateTime(transaction.occurred_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyState}>No transactions captured yet.</div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Active alerts</h2>
            <p className={styles.inlineHelp}>Auto-populated from analytics triggers.</p>
          </div>
          {alerts.length ? (
            <div className={styles.listGrid}>
              {alerts.map((alert: Alert) => (
                <article key={alert.id} className={styles.card}>
                  <p className={styles.cardTitle}>{medicineMap.get(alert.medicine)?.name ?? "Unknown medicine"}</p>
                  <span className={styles.tagStatus} data-variant={alert.status}>
                    {alert.status}
                  </span>
                  <p>{alert.message}</p>
                  <p className={styles.inlineHelp}>{formatDateTime(alert.triggered_at)}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>No alerts 🎉</div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Create facility</h2>
            <p className={styles.inlineHelp}>Adds a facility through the same API the mobile app would call.</p>
          </div>
          <form className={styles.formGrid} onSubmit={handleFacilitySubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="facility-name">Name</label>
              <input
                id="facility-name"
                className={styles.textInput}
                value={facilityForm.name}
                onChange={(event) => setFacilityForm({ ...facilityForm, name: event.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="facility-code">Code</label>
              <input
                id="facility-code"
                className={styles.textInput}
                value={facilityForm.code}
                onChange={(event) => setFacilityForm({ ...facilityForm, code: event.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="facility-type">Type</label>
              <select
                id="facility-type"
                className={styles.selectInput}
                value={facilityForm.facility_type}
                onChange={(event) => setFacilityForm({ ...facilityForm, facility_type: event.target.value })}
              >
                <option value="hospital">Hospital</option>
                <option value="clinic">Clinic</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="health_post">Health Post</option>
                <option value="warehouse">Warehouse</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="facility-ownership">Ownership</label>
              <select
                id="facility-ownership"
                className={styles.selectInput}
                value={facilityForm.ownership}
                onChange={(event) => setFacilityForm({ ...facilityForm, ownership: event.target.value })}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="faith_based">Faith based</option>
                <option value="ngo">NGO</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="facility-state">State</label>
              <input
                id="facility-state"
                className={styles.textInput}
                value={facilityForm.state}
                onChange={(event) => setFacilityForm({ ...facilityForm, state: event.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="facility-city">City</label>
              <input
                id="facility-city"
                className={styles.textInput}
                value={facilityForm.city}
                onChange={(event) => setFacilityForm({ ...facilityForm, city: event.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="facility-lga">LGA</label>
              <input
                id="facility-lga"
                className={styles.textInput}
                value={facilityForm.lga}
                onChange={(event) => setFacilityForm({ ...facilityForm, lga: event.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="facility-address">Address</label>
              <input
                id="facility-address"
                className={styles.textInput}
                value={facilityForm.address}
                onChange={(event) => setFacilityForm({ ...facilityForm, address: event.target.value })}
              />
            </div>
            <div className={styles.actionsRow}>
              <button className={styles.primaryButton} type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save facility"}
              </button>
            </div>
          </form>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Record inventory transaction</h2>
            <p className={styles.inlineHelp}>Posts directly to the `/transactions/` endpoint.</p>
          </div>
          <form className={styles.formGrid} onSubmit={handleTransactionSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="transaction-facility">Facility</label>
              <select
                id="transaction-facility"
                className={styles.selectInput}
                value={transactionForm.facility}
                onChange={(event) => setTransactionForm({ ...transactionForm, facility: event.target.value })}
                required
              >
                <option value="" disabled>
                  Select facility
                </option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="transaction-medicine">Medicine</label>
              <select
                id="transaction-medicine"
                className={styles.selectInput}
                value={transactionForm.medicine}
                onChange={(event) => setTransactionForm({ ...transactionForm, medicine: event.target.value })}
                required
              >
                <option value="" disabled>
                  Select medicine
                </option>
                {medicines.map((medicine) => (
                  <option key={medicine.id} value={medicine.id}>
                    {medicine.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="transaction-type">Transaction type</label>
              <select
                id="transaction-type"
                className={styles.selectInput}
                value={transactionForm.transaction_type}
                onChange={(event) => setTransactionForm({ ...transactionForm, transaction_type: event.target.value })}
              >
                <option value="receipt">Receipt</option>
                <option value="issue">Issue</option>
                <option value="adjustment">Adjustment</option>
                <option value="stock_count">Stock count</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="transaction-quantity">Quantity</label>
              <input
                id="transaction-quantity"
                type="number"
                className={styles.numberInput}
                value={transactionForm.quantity}
                onChange={(event) => setTransactionForm({ ...transactionForm, quantity: event.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="transaction-source">Source / destination</label>
              <input
                id="transaction-source"
                className={styles.textInput}
                value={transactionForm.source_destination}
                onChange={(event) => setTransactionForm({ ...transactionForm, source_destination: event.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="transaction-batch">Batch number</label>
              <input
                id="transaction-batch"
                className={styles.textInput}
                value={transactionForm.batch_number}
                onChange={(event) => setTransactionForm({ ...transactionForm, batch_number: event.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="transaction-occurred">Occurred at</label>
              <input
                id="transaction-occurred"
                type="datetime-local"
                className={styles.dateInput}
                value={transactionForm.occurred_at}
                onChange={(event) => setTransactionForm({ ...transactionForm, occurred_at: event.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="transaction-notes">Notes</label>
              <textarea
                id="transaction-notes"
                className={styles.textArea}
                value={transactionForm.notes}
                onChange={(event) => setTransactionForm({ ...transactionForm, notes: event.target.value })}
              />
            </div>
            <div className={styles.actionsRow}>
              <button className={styles.primaryButton} type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Record transaction"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default App;
