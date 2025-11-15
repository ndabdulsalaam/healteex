import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../App.module.css";
import { fetchDashboard } from "../api";
import { useAuth } from "../auth/AuthContext";
const ROLE_BLURBS = {
    pharmacist: "Monitor stock levels, record transactions, and respond to alerts at your facility.",
    facility_admin: "Oversee facility performance, approve orders, and coordinate with supply partners.",
    policy_maker: "Review regional metrics, anticipate shortages, and plan interventions.",
    super_admin: "Configure the platform, integrations, and manage cross-organization access.",
};
export function DashboardPage() {
    const { accessToken, user, signOut } = useAuth();
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    useEffect(() => {
        if (!accessToken)
            return;
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
        if (!dashboard)
            return 0;
        return dashboard.stockSnapshots.reduce((sum, snapshot) => sum + Number(snapshot.stock_on_hand), 0);
    }, [dashboard]);
    const latestTransactions = useMemo(() => dashboard?.transactions.slice(0, 5) ?? [], [dashboard]);
    const openAlerts = useMemo(() => dashboard?.alerts.filter((alert) => alert.status === "open") ?? [], [dashboard]);
    const handleSignOut = () => {
        signOut();
        navigate("/");
    };
    return (_jsx("div", { className: styles.appShell, children: _jsxs("section", { className: styles.dashboardShell, children: [_jsxs("header", { className: styles.dashboardHeader, children: [_jsxs("div", { className: styles.titleBlock, children: [_jsxs("h1", { children: ["Welcome back", user?.first_name ? `, ${user.first_name}` : ""] }), _jsx("p", { children: ROLE_BLURBS[user?.role ?? ""] ?? "Review current supply and forecast performance across your facilities." })] }), _jsxs("div", { className: styles.actionsRow, children: [_jsx("button", { type: "button", className: styles.secondaryButton, onClick: () => navigate("/profile"), disabled: true, children: "Edit profile" }), _jsx("button", { type: "button", className: styles.primaryButton, onClick: handleSignOut, children: "Sign out" })] })] }), status ? _jsx("p", { className: styles.statusMessage, children: status }) : null, _jsxs("section", { className: styles.summaryGrid, children: [_jsxs("article", { className: styles.summaryCard, children: [_jsx("h2", { children: "Total facilities" }), _jsx("p", { children: dashboard?.facilities.length ?? 0 })] }), _jsxs("article", { className: styles.summaryCard, children: [_jsx("h2", { children: "Medicines tracked" }), _jsx("p", { children: dashboard?.medicines.length ?? 0 })] }), _jsxs("article", { className: styles.summaryCard, children: [_jsx("h2", { children: "Open alerts" }), _jsx("p", { children: openAlerts.length })] }), _jsxs("article", { className: styles.summaryCard, children: [_jsx("h2", { children: "Stock on hand" }), _jsx("p", { children: totalStock.toLocaleString() })] })] }), _jsxs("section", { className: styles.section, children: [_jsxs("header", { className: styles.sectionHeader, children: [_jsx("h2", { children: "Recent transactions" }), _jsx("span", { style: { color: "#475467" }, children: latestTransactions.length === 0 ? "No recent movements" : "Showing latest five entries" })] }), _jsxs("div", { className: styles.listGrid, children: [latestTransactions.map((transaction) => (_jsxs("article", { className: styles.card, children: [_jsx("h3", { style: { marginTop: 0, marginBottom: "0.25rem" }, children: transaction.transaction_type }), _jsxs("p", { style: { margin: 0, color: "#475467" }, children: ["Quantity ", transaction.quantity, " \u2013 ", new Date(transaction.occurred_at).toLocaleDateString()] })] }, transaction.id))), latestTransactions.length === 0 ? _jsx("p", { style: { color: "#475467" }, children: "Transactions will appear as data flows in." }) : null] })] }), _jsxs("section", { className: styles.section, children: [_jsx("header", { className: styles.sectionHeader, children: _jsx("h2", { children: "Alerts requiring attention" }) }), _jsxs("div", { className: styles.listGrid, children: [openAlerts.map((alert) => (_jsxs("article", { className: styles.card, children: [_jsx("h3", { style: { marginTop: 0 }, children: alert.alert_type.replace("_", " ") }), _jsx("p", { style: { margin: "0.25rem 0", color: "#0f172a" }, children: alert.message }), _jsxs("small", { style: { color: "#64748b" }, children: ["Triggered ", new Date(alert.triggered_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })] })] }, alert.id))), openAlerts.length === 0 ? _jsx("p", { style: { color: "#475467" }, children: "You are all caught up!" }) : null] })] }), loading ? _jsx("p", { style: { color: "#475467" }, children: "Refreshing data\u2026" }) : null] }) }));
}
