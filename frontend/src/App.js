import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./App.module.css";
import { createFacility, createTransaction, fetchDashboard, login } from "./api";
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
    const [token, setToken] = useState(() => localStorage.getItem("healteex-token"));
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [facilityForm, setFacilityForm] = useState(FACILITY_INITIAL_STATE);
    const [transactionForm, setTransactionForm] = useState(TRANSACTION_INITIAL_STATE);
    const facilityMap = useMemo(() => {
        const entries = new Map();
        dashboard?.facilities.forEach((facility) => entries.set(facility.id, facility));
        return entries;
    }, [dashboard]);
    const medicineMap = useMemo(() => {
        const entries = new Map();
        dashboard?.medicines.forEach((medicine) => entries.set(medicine.id, medicine));
        return entries;
    }, [dashboard]);
    const loadDashboard = useCallback(async (authToken) => {
        setLoading(true);
        try {
            const next = await fetchDashboard(authToken);
            setDashboard(next);
            setStatusMessage(null);
        }
        catch (error) {
            const detail = error instanceof Error ? error.message : "Unable to fetch data";
            setStatusMessage(detail);
            if (detail.toLowerCase().includes("authentication")) {
                setToken(null);
            }
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        if (token) {
            localStorage.setItem("healteex-token", token);
            void loadDashboard(token);
        }
        else {
            localStorage.removeItem("healteex-token");
            setDashboard(null);
        }
    }, [token, loadDashboard]);
    const handleLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const authToken = await login(credentials.username, credentials.password);
            setToken(authToken);
            setStatusMessage("Authentication successful. Loading data...");
        }
        catch (error) {
            const detail = error instanceof Error ? error.message : "Login failed";
            setStatusMessage(detail || "Invalid credentials");
        }
        finally {
            setLoading(false);
        }
    };
    const handleLogout = () => {
        setToken(null);
        setFacilityForm(FACILITY_INITIAL_STATE);
        setTransactionForm({ ...TRANSACTION_INITIAL_STATE, occurred_at: new Date().toISOString().slice(0, 16) });
        setCredentials({ username: "", password: "" });
    };
    const handleFacilitySubmit = async (event) => {
        event.preventDefault();
        if (!token)
            return;
        setLoading(true);
        try {
            await createFacility(token, facilityForm);
            setFacilityForm(FACILITY_INITIAL_STATE);
            setStatusMessage("Facility created");
            await loadDashboard(token);
        }
        catch (error) {
            const detail = error instanceof Error ? error.message : "Unable to create facility";
            setStatusMessage(detail);
        }
        finally {
            setLoading(false);
        }
    };
    const handleTransactionSubmit = async (event) => {
        event.preventDefault();
        if (!token)
            return;
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
        }
        catch (error) {
            const detail = error instanceof Error ? error.message : "Unable to create transaction";
            setStatusMessage(detail);
        }
        finally {
            setLoading(false);
        }
    };
    const totalStock = useMemo(() => {
        if (!dashboard)
            return 0;
        return dashboard.stockSnapshots.reduce((sum, snapshot) => sum + Number(snapshot.stock_on_hand), 0);
    }, [dashboard]);
    const openAlerts = useMemo(() => dashboard?.alerts.filter((alert) => alert.status === "open").length ?? 0, [dashboard]);
    if (!token) {
        return (_jsx("div", { className: styles.appShell, children: _jsxs("section", { className: styles.authWrapper, children: [_jsxs("header", { className: styles.authHeader, children: [_jsx("h1", { children: "Healteex Control Center" }), _jsx("p", { children: "Use any seeded credentials (e.g. username \"superadmin\") with the password \"ChangeMe123!\"." })] }), _jsxs("form", { className: styles.loginCard, onSubmit: handleLogin, children: [_jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "username", children: "Username" }), _jsx("input", { id: "username", className: styles.textInput, value: credentials.username, onChange: (event) => setCredentials({ ...credentials, username: event.target.value }), required: true })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "password", children: "Password" }), _jsx("input", { id: "password", type: "password", className: styles.textInput, value: credentials.password, onChange: (event) => setCredentials({ ...credentials, password: event.target.value }), required: true })] }), _jsx("button", { className: styles.primaryButton, type: "submit", disabled: loading, children: loading ? "Authenticating..." : "Sign in" }), statusMessage ? _jsx("p", { className: styles.statusMessage, children: statusMessage }) : null] })] }) }));
    }
    const facilities = dashboard?.facilities ?? [];
    const medicines = dashboard?.medicines ?? [];
    const transactions = dashboard ? dashboard.transactions.slice(0, 8) : [];
    const alerts = dashboard?.alerts ?? [];
    const formatDateTime = (value) => new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
    return (_jsx("div", { className: styles.appShell, children: _jsxs("div", { className: styles.dashboardShell, children: [_jsxs("header", { className: styles.dashboardHeader, children: [_jsxs("div", { className: styles.titleBlock, children: [_jsx("h1", { children: "Inventory Overview" }), _jsx("p", { children: "Authenticated via token. Connected to Django REST API." })] }), _jsxs("div", { className: styles.actionsRow, children: [_jsx("button", { className: styles.secondaryButton, type: "button", onClick: () => token && loadDashboard(token), disabled: loading, children: "Refresh" }), _jsx("button", { className: styles.secondaryButton, type: "button", onClick: handleLogout, children: "Log out" })] })] }), _jsxs("section", { className: styles.summaryGrid, children: [_jsxs("article", { className: styles.summaryCard, children: [_jsx("h2", { children: "Facilities" }), _jsx("p", { children: facilities.length })] }), _jsxs("article", { className: styles.summaryCard, children: [_jsx("h2", { children: "Medicines tracked" }), _jsx("p", { children: medicines.length })] }), _jsxs("article", { className: styles.summaryCard, children: [_jsx("h2", { children: "Open alerts" }), _jsx("p", { children: openAlerts })] }), _jsxs("article", { className: styles.summaryCard, children: [_jsx("h2", { children: "National stock on hand" }), _jsx("p", { children: totalStock.toLocaleString() })] })] }), statusMessage ? _jsx("p", { className: styles.statusMessage, children: statusMessage }) : null, _jsxs("section", { className: styles.section, children: [_jsxs("div", { className: styles.sectionHeader, children: [_jsx("h2", { children: "Key facilities" }), _jsx("p", { className: styles.inlineHelp, children: "Latest entries from the facility API." })] }), facilities.length ? (_jsx("div", { className: styles.listGrid, children: facilities.slice(0, 4).map((facility) => (_jsxs("article", { className: styles.card, children: [_jsx("p", { className: styles.cardTitle, children: facility.name }), _jsx("span", { className: styles.pill, children: facility.facility_type }), _jsxs("p", { children: [facility.city, ", ", facility.state] }), _jsxs("p", { children: ["Code: ", facility.code] })] }, facility.id))) })) : (_jsx("div", { className: styles.emptyState, children: "No facilities yet." }))] }), _jsxs("section", { className: styles.section, children: [_jsxs("div", { className: styles.sectionHeader, children: [_jsx("h2", { children: "Recent transactions" }), _jsx("p", { className: styles.inlineHelp, children: "Syncs straight from the `/transactions/` endpoint." })] }), transactions.length ? (_jsx("div", { className: styles.tableWrapper, children: _jsxs("table", { className: styles.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Facility" }), _jsx("th", { children: "Medicine" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Quantity" }), _jsx("th", { children: "Occurred at" })] }) }), _jsx("tbody", { children: transactions.map((transaction) => (_jsxs("tr", { children: [_jsx("td", { children: facilityMap.get(transaction.facility)?.name ?? transaction.facility }), _jsx("td", { children: medicineMap.get(transaction.medicine)?.name ?? transaction.medicine }), _jsx("td", { children: transaction.transaction_type }), _jsx("td", { children: transaction.quantity }), _jsx("td", { children: formatDateTime(transaction.occurred_at) })] }, transaction.id))) })] }) })) : (_jsx("div", { className: styles.emptyState, children: "No transactions captured yet." }))] }), _jsxs("section", { className: styles.section, children: [_jsxs("div", { className: styles.sectionHeader, children: [_jsx("h2", { children: "Active alerts" }), _jsx("p", { className: styles.inlineHelp, children: "Auto-populated from analytics triggers." })] }), alerts.length ? (_jsx("div", { className: styles.listGrid, children: alerts.map((alert) => (_jsxs("article", { className: styles.card, children: [_jsx("p", { className: styles.cardTitle, children: medicineMap.get(alert.medicine)?.name ?? "Unknown medicine" }), _jsx("span", { className: styles.tagStatus, "data-variant": alert.status, children: alert.status }), _jsx("p", { children: alert.message }), _jsx("p", { className: styles.inlineHelp, children: formatDateTime(alert.triggered_at) })] }, alert.id))) })) : (_jsx("div", { className: styles.emptyState, children: "No alerts \uD83C\uDF89" }))] }), _jsxs("section", { className: styles.section, children: [_jsxs("div", { className: styles.sectionHeader, children: [_jsx("h2", { children: "Create facility" }), _jsx("p", { className: styles.inlineHelp, children: "Adds a facility through the same API the mobile app would call." })] }), _jsxs("form", { className: styles.formGrid, onSubmit: handleFacilitySubmit, children: [_jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "facility-name", children: "Name" }), _jsx("input", { id: "facility-name", className: styles.textInput, value: facilityForm.name, onChange: (event) => setFacilityForm({ ...facilityForm, name: event.target.value }), required: true })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "facility-code", children: "Code" }), _jsx("input", { id: "facility-code", className: styles.textInput, value: facilityForm.code, onChange: (event) => setFacilityForm({ ...facilityForm, code: event.target.value }), required: true })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "facility-type", children: "Type" }), _jsxs("select", { id: "facility-type", className: styles.selectInput, value: facilityForm.facility_type, onChange: (event) => setFacilityForm({ ...facilityForm, facility_type: event.target.value }), children: [_jsx("option", { value: "hospital", children: "Hospital" }), _jsx("option", { value: "clinic", children: "Clinic" }), _jsx("option", { value: "pharmacy", children: "Pharmacy" }), _jsx("option", { value: "health_post", children: "Health Post" }), _jsx("option", { value: "warehouse", children: "Warehouse" })] })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "facility-ownership", children: "Ownership" }), _jsxs("select", { id: "facility-ownership", className: styles.selectInput, value: facilityForm.ownership, onChange: (event) => setFacilityForm({ ...facilityForm, ownership: event.target.value }), children: [_jsx("option", { value: "public", children: "Public" }), _jsx("option", { value: "private", children: "Private" }), _jsx("option", { value: "faith_based", children: "Faith based" }), _jsx("option", { value: "ngo", children: "NGO" })] })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "facility-state", children: "State" }), _jsx("input", { id: "facility-state", className: styles.textInput, value: facilityForm.state, onChange: (event) => setFacilityForm({ ...facilityForm, state: event.target.value }), required: true })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "facility-city", children: "City" }), _jsx("input", { id: "facility-city", className: styles.textInput, value: facilityForm.city, onChange: (event) => setFacilityForm({ ...facilityForm, city: event.target.value }), required: true })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "facility-lga", children: "LGA" }), _jsx("input", { id: "facility-lga", className: styles.textInput, value: facilityForm.lga, onChange: (event) => setFacilityForm({ ...facilityForm, lga: event.target.value }) })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "facility-address", children: "Address" }), _jsx("input", { id: "facility-address", className: styles.textInput, value: facilityForm.address, onChange: (event) => setFacilityForm({ ...facilityForm, address: event.target.value }) })] }), _jsx("div", { className: styles.actionsRow, children: _jsx("button", { className: styles.primaryButton, type: "submit", disabled: loading, children: loading ? "Saving..." : "Save facility" }) })] })] }), _jsxs("section", { className: styles.section, children: [_jsxs("div", { className: styles.sectionHeader, children: [_jsx("h2", { children: "Record inventory transaction" }), _jsx("p", { className: styles.inlineHelp, children: "Posts directly to the `/transactions/` endpoint." })] }), _jsxs("form", { className: styles.formGrid, onSubmit: handleTransactionSubmit, children: [_jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "transaction-facility", children: "Facility" }), _jsxs("select", { id: "transaction-facility", className: styles.selectInput, value: transactionForm.facility, onChange: (event) => setTransactionForm({ ...transactionForm, facility: event.target.value }), required: true, children: [_jsx("option", { value: "", disabled: true, children: "Select facility" }), facilities.map((facility) => (_jsx("option", { value: facility.id, children: facility.name }, facility.id)))] })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "transaction-medicine", children: "Medicine" }), _jsxs("select", { id: "transaction-medicine", className: styles.selectInput, value: transactionForm.medicine, onChange: (event) => setTransactionForm({ ...transactionForm, medicine: event.target.value }), required: true, children: [_jsx("option", { value: "", disabled: true, children: "Select medicine" }), medicines.map((medicine) => (_jsx("option", { value: medicine.id, children: medicine.name }, medicine.id)))] })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "transaction-type", children: "Transaction type" }), _jsxs("select", { id: "transaction-type", className: styles.selectInput, value: transactionForm.transaction_type, onChange: (event) => setTransactionForm({ ...transactionForm, transaction_type: event.target.value }), children: [_jsx("option", { value: "receipt", children: "Receipt" }), _jsx("option", { value: "issue", children: "Issue" }), _jsx("option", { value: "adjustment", children: "Adjustment" }), _jsx("option", { value: "stock_count", children: "Stock count" })] })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "transaction-quantity", children: "Quantity" }), _jsx("input", { id: "transaction-quantity", type: "number", className: styles.numberInput, value: transactionForm.quantity, onChange: (event) => setTransactionForm({ ...transactionForm, quantity: event.target.value }), required: true })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "transaction-source", children: "Source / destination" }), _jsx("input", { id: "transaction-source", className: styles.textInput, value: transactionForm.source_destination, onChange: (event) => setTransactionForm({ ...transactionForm, source_destination: event.target.value }) })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "transaction-batch", children: "Batch number" }), _jsx("input", { id: "transaction-batch", className: styles.textInput, value: transactionForm.batch_number, onChange: (event) => setTransactionForm({ ...transactionForm, batch_number: event.target.value }) })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "transaction-occurred", children: "Occurred at" }), _jsx("input", { id: "transaction-occurred", type: "datetime-local", className: styles.dateInput, value: transactionForm.occurred_at, onChange: (event) => setTransactionForm({ ...transactionForm, occurred_at: event.target.value }), required: true })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "transaction-notes", children: "Notes" }), _jsx("textarea", { id: "transaction-notes", className: styles.textArea, value: transactionForm.notes, onChange: (event) => setTransactionForm({ ...transactionForm, notes: event.target.value }) })] }), _jsx("div", { className: styles.actionsRow, children: _jsx("button", { className: styles.primaryButton, type: "submit", disabled: loading, children: loading ? "Submitting..." : "Record transaction" }) })] })] })] }) }));
}
export default App;
