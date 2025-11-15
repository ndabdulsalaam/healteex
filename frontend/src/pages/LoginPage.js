import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import styles from "../App.module.css";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
const ROLE_OPTIONS = [
    { value: "pharmacist", label: "Pharmacist" },
    { value: "facility_admin", label: "Facility Administrator" },
    { value: "policy_maker", label: "Policy Maker" },
    { value: "super_admin", label: "Super Administrator" },
];
export function LoginPage() {
    const { signInWithPassword, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({
        email: "",
        password: "",
        role: "",
        remember_me: true,
    });
    const [status, setStatus] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const handleChange = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };
    const onSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setStatus(null);
        try {
            await signInWithPassword({
                email: form.email,
                password: form.password,
                remember_me: form.remember_me,
                role: form.role || undefined,
            });
            const redirectTo = location.state?.from?.pathname ?? "/dashboard";
            navigate(redirectTo, { replace: true });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unable to sign in";
            setStatus(message);
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleGoogleCredential = useCallback(async (credential) => {
        setSubmitting(true);
        setStatus(null);
        try {
            await signInWithGoogle({
                id_token: credential,
                remember_me: form.remember_me,
                role: form.role || undefined,
            });
            navigate("/dashboard", { replace: true });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Google sign-in failed";
            setStatus(message);
        }
        finally {
            setSubmitting(false);
        }
    }, [form.remember_me, form.role, navigate, signInWithGoogle]);
    return (_jsx("div", { className: styles.appShell, children: _jsxs("section", { className: styles.authWrapper, children: [_jsxs("header", { className: styles.authHeader, children: [_jsx("h1", { children: "Sign in to Healteex" }), _jsx("p", { children: "Access forecasts, inventory dashboards, and integration tools tailored to your role." })] }), _jsxs("form", { className: styles.loginCard, onSubmit: onSubmit, children: [_jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "email", children: "Email" }), _jsx("input", { id: "email", type: "email", className: styles.textInput, autoComplete: "email", value: form.email, onChange: (event) => handleChange("email", event.target.value), required: true })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "password", children: "Password" }), _jsx("input", { id: "password", type: "password", className: styles.textInput, autoComplete: "current-password", value: form.password, onChange: (event) => handleChange("password", event.target.value), required: true })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "role", children: "Role (needed if this email has multiple accounts)" }), _jsxs("select", { id: "role", className: styles.selectInput, value: form.role, onChange: (event) => handleChange("role", event.target.value), children: [_jsx("option", { value: "", children: "Any role" }), ROLE_OPTIONS.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] })] }), _jsx("label", { className: styles.formGroup, children: _jsxs("span", { children: [_jsx("input", { type: "checkbox", checked: form.remember_me, onChange: (event) => handleChange("remember_me", event.target.checked) }), " ", "Keep me signed in on this device"] }) }), _jsx("button", { className: styles.primaryButton, type: "submit", disabled: submitting, children: submitting ? "Signing in..." : "Continue" }), _jsxs("div", { style: { display: "grid", gap: "0.75rem" }, children: [_jsx(GoogleSignInButton, { onCredential: handleGoogleCredential, disabled: submitting }), _jsxs("p", { style: { margin: 0, fontSize: "0.9rem", color: "#475467" }, children: ["Don't have an account? ", _jsx("a", { href: "/signup", children: "Start signup" }), "."] })] }), status ? _jsx("p", { className: styles.statusMessage, children: status }) : null] })] }) }));
}
