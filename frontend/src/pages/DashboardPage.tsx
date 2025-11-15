import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../App.module.css";
import { fetchDashboard } from "../api";
import type { DashboardData } from "../types";
import { useAuth } from "../auth/AuthContext";

const ROLE_BLURBS: Record<string, string> = {
  pharmacist: "Monitor stock levels, record transactions, and respond to alerts at your facility.",
  facility_admin: "Oversee facility performance, approve orders, and coordinate with supply partners.",
  policy_maker: "Review regional metrics, anticipate shortages, and plan interventions.",
  super_admin: "Configure the platform, integrations, and manage cross-organization access.",
};

export function DashboardPage() {
  const { accessToken, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    fetchDashboard(accessToken)
      .then((data) => {
        setDashboard(data);
        setStatus(null);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Unable to load dashboard";
        setStatus(message);
      })
      .finally(() => setLoading(false));
  }, [accessToken]);

  const totalStock = useMemo(() => {
    if (!dashboard) return 0;
    return dashboard.stockSnapshots.reduce((sum, snapshot) => sum + Number(snapshot.stock_on_hand), 0);
  }, [dashboard]);

  const latestTransactions = useMemo(() => dashboard?.transactions.slice(0, 5) ?? [], [dashboard]);
  const openAlerts = useMemo(() => dashboard?.alerts.filter((alert) => alert.status === "open") ?? [], [dashboard]);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <div className={styles.appShell}>
      <section className={styles.dashboardShell}>
        <header className={styles.dashboardHeader}>
          <div className={styles.titleBlock}>
            <h1>Welcome back{user?.first_name ? `, ${user.first_name}` : ""}</h1>
            <p>{ROLE_BLURBS[user?.role ?? ""] ?? "Review current supply and forecast performance across your facilities."}</p>
          </div>
          <div className={styles.actionsRow}>
            <button type="button" className={styles.secondaryButton} onClick={() => navigate("/profile")} disabled>
              Edit profile
            </button>
            <button type="button" className={styles.primaryButton} onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </header>

        {status ? <p className={styles.statusMessage}>{status}</p> : null}

        <section className={styles.summaryGrid}>
          <article className={styles.summaryCard}>
            <h2>Total facilities</h2>
            <p>{dashboard?.facilities.length ?? 0}</p>
          </article>
          <article className={styles.summaryCard}>
            <h2>Medicines tracked</h2>
            <p>{dashboard?.medicines.length ?? 0}</p>
          </article>
          <article className={styles.summaryCard}>
            <h2>Open alerts</h2>
            <p>{openAlerts.length}</p>
          </article>
          <article className={styles.summaryCard}>
            <h2>Stock on hand</h2>
            <p>{totalStock.toLocaleString()}</p>
          </article>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>Recent transactions</h2>
            <span style={{ color: "#475467" }}>
              {latestTransactions.length === 0 ? "No recent movements" : "Showing latest five entries"}
            </span>
          </header>
          <div className={styles.listGrid}>
            {latestTransactions.map((transaction) => (
              <article key={transaction.id} className={styles.card}>
                <h3 style={{ marginTop: 0, marginBottom: "0.25rem" }}>{transaction.transaction_type}</h3>
                <p style={{ margin: 0, color: "#475467" }}>
                  Quantity {transaction.quantity} – {new Date(transaction.occurred_at).toLocaleDateString()}
                </p>
              </article>
            ))}
            {latestTransactions.length === 0 ? <p style={{ color: "#475467" }}>Transactions will appear as data flows in.</p> : null}
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>Alerts requiring attention</h2>
          </header>
          <div className={styles.listGrid}>
            {openAlerts.map((alert) => (
              <article key={alert.id} className={styles.card}>
                <h3 style={{ marginTop: 0 }}>{alert.alert_type.replace("_", " ")}</h3>
                <p style={{ margin: "0.25rem 0", color: "#0f172a" }}>{alert.message}</p>
                <small style={{ color: "#64748b" }}>
                  Triggered {new Date(alert.triggered_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </small>
              </article>
            ))}
            {openAlerts.length === 0 ? <p style={{ color: "#475467" }}>You are all caught up!</p> : null}
          </div>
        </section>

        {loading ? <p style={{ color: "#475467" }}>Refreshing data…</p> : null}
      </section>
    </div>
  );
}
