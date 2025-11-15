import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import styles from "../App.module.css";
export function LandingPage() {
    const { isAuthenticated, user } = useAuth();
    return (_jsx("div", { className: styles.appShell, children: _jsxs("section", { className: styles.authWrapper, children: [_jsxs("header", { className: styles.authHeader, children: [_jsx("h1", { children: "Welcome to Healteex" }), _jsx("p", { children: "A unified workspace for pharmacists, policymakers, and administrators to forecast demand, manage stock, and keep facilities supplied." })] }), _jsx("div", { className: styles.actionsRow, children: isAuthenticated ? (_jsxs(_Fragment, { children: [_jsxs("p", { children: ["Signed in as ", _jsx("strong", { children: user?.email }), ". Ready to continue?"] }), _jsx(Link, { className: styles.primaryButton, to: "/dashboard", children: "Enter dashboard" })] })) : (_jsxs(_Fragment, { children: [_jsx(Link, { className: styles.primaryButton, to: "/login", children: "Sign in" }), _jsx(Link, { className: styles.secondaryButton, to: "/signup", children: "Create an account" })] })) })] }) }));
}
