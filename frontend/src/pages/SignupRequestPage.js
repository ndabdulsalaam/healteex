import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "../App.module.css";
import { requestSignup } from "../api";
const ROLE_OPTIONS = [
    { value: "pharmacist", label: "Pharmacist", description: "Track stock levels, submit transactions, and manage alerts." },
    {
        value: "facility_admin",
        label: "Facility Administrator",
        description: "Oversee facility operations, approve transactions, and coordinate staff.",
    },
    {
        value: "policy_maker",
        label: "Policy Maker",
        description: "Review national/regional trends and monitor stock-out risks.",
    },
    { value: "super_admin", label: "Super Administrator", description: "Platform-wide configuration, integrations, and user management." },
];
export function SignupRequestPage() {
    const params = useParams();
    const [form, setForm] = useState({
        email: "",
        role: params.role ?? "pharmacist",
    });
    const [status, setStatus] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [successPayload, setSuccessPayload] = useState(null);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus(null);
        setSubmitting(true);
        try {
            const response = await requestSignup(form);
            setSuccessPayload({ expires_in_minutes: response.expires_in_minutes });
            setStatus(response.detail);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unable to start signup";
            setStatus(message);
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsx("div", { className: styles.appShell, children: _jsxs("section", { className: styles.authWrapper, children: [_jsxs("header", { className: styles.authHeader, children: [_jsx("h1", { children: "Create your Healteex account" }), _jsx("p", { children: "Select your role so we can tailor data access and onboarding steps." })] }), _jsxs("form", { className: styles.loginCard, onSubmit: handleSubmit, children: [_jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "email", children: "Work email" }), _jsx("input", { id: "email", type: "email", className: styles.textInput, value: form.email, onChange: (event) => setForm((previous) => ({ ...previous, email: event.target.value })), required: true })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { htmlFor: "role", children: "Role" }), _jsx("select", { id: "role", className: styles.selectInput, value: form.role, onChange: (event) => setForm((previous) => ({ ...previous, role: event.target.value })), children: ROLE_OPTIONS.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) }), _jsx("small", { style: { color: "#475467" }, children: ROLE_OPTIONS.find((option) => option.value === form.role)?.description })] }), _jsx("button", { className: styles.primaryButton, type: "submit", disabled: submitting, children: submitting ? "Sending token..." : "Send verification token" }), _jsxs("p", { style: { margin: 0, fontSize: "0.9rem", color: "#475467" }, children: ["Already registered? ", _jsx(Link, { to: "/login", children: "Sign in" }), "."] }), status ? _jsx("p", { className: styles.statusMessage, children: status }) : null, successPayload ? (_jsxs("p", { style: { margin: 0, color: "#047857", fontWeight: 600 }, children: ["Check your email for the verification token (valid for ", successPayload.expires_in_minutes, " minutes).", " ", _jsx(Link, { to: `/signup/verify?role=${form.role}`, children: "Enter token" })] })) : null] })] }) }));
}
