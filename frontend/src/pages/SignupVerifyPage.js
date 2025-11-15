import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "../App.module.css";
import { verifySignup } from "../api";
import { useAuth } from "../auth/AuthContext";
export function SignupVerifyPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const auth = useAuth();
    const initialToken = searchParams.get("token") ?? "";
    const roleHint = searchParams.get("role");
    const [form, setForm] = useState({
        token: initialToken,
        password: "",
        first_name: "",
        last_name: "",
        remember_me: true,
    });
    const [status, setStatus] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setStatus(null);
        try {
            const response = await verifySignup({
                token: form.token.trim(),
                password: form.password || undefined,
                first_name: form.first_name || undefined,
                last_name: form.last_name || undefined,
                remember_me: form.remember_me,
            });
            auth.applyAuthResponse(response);
            navigate("/dashboard", { replace: true });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Verification failed";
            setStatus(message);
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsx("div", { className: styles.appShell, children: _jsxs("section", { className: styles.authWrapper, children: [_jsxs("header", { className: styles.authHeader, children: [_jsx("h1", { children: "Verify your email" }), _jsxs("p", { children: ["Paste the token we sent to your inbox", roleHint ? (_jsxs(_Fragment, { children: [" ", "for the ", _jsx("strong", { children: roleHint.replace("_", " ") }), " role"] })) : null, "."] })] }), _jsxs("form", { className: styles.loginCard, onSubmit: handleSubmit, children: [_jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "token", children: "Verification token" }), _jsx("input", { id: "token", className: styles.textInput, value: form.token, onChange: (event) => setForm((previous) => ({ ...previous, token: event.target.value })), required: true })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "password", children: "Password (optional)" }), _jsx("input", { id: "password", type: "password", className: styles.textInput, placeholder: "Set a password to allow email-based login", value: form.password, onChange: (event) => setForm((previous) => ({ ...previous, password: event.target.value })) })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "first_name", children: "First name" }), _jsx("input", { id: "first_name", className: styles.textInput, value: form.first_name, onChange: (event) => setForm((previous) => ({ ...previous, first_name: event.target.value })) })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "last_name", children: "Last name" }), _jsx("input", { id: "last_name", className: styles.textInput, value: form.last_name, onChange: (event) => setForm((previous) => ({ ...previous, last_name: event.target.value })) })] }), _jsx("label", { className: styles.formGroup, children: _jsxs("span", { children: [_jsx("input", { type: "checkbox", checked: form.remember_me, onChange: (event) => setForm((previous) => ({ ...previous, remember_me: event.target.checked })) }), " ", "Keep me signed in after verification"] }) }), _jsx("button", { className: styles.primaryButton, type: "submit", disabled: submitting, children: submitting ? "Completing signup..." : "Complete signup" }), status ? _jsx("p", { className: styles.statusMessage, children: status }) : null] })] }) }));
}
