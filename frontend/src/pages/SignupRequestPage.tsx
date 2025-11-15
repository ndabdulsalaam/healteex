import { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "../App.module.css";
import { requestSignup, type SignupRequestPayload } from "../api";
import type { UserRole } from "../types";

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
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
  const params = useParams<{ role?: UserRole }>();
  const [form, setForm] = useState<SignupRequestPayload>({
    email: "",
    role: (params.role as UserRole) ?? "pharmacist",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successPayload, setSuccessPayload] = useState<{ expires_in_minutes: number } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      const response = await requestSignup(form);
      setSuccessPayload({ expires_in_minutes: response.expires_in_minutes });
      setStatus(response.detail);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start signup";
      setStatus(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.appShell}>
      <section className={styles.authWrapper}>
        <header className={styles.authHeader}>
          <h1>Create your Healteex account</h1>
          <p>Select your role so we can tailor data access and onboarding steps.</p>
        </header>
        <form className={styles.loginCard} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Work email</label>
            <input
              id="email"
              type="email"
              className={styles.textInput}
              value={form.email}
              onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="role">Role</label>
            <select
              id="role"
              className={styles.selectInput}
              value={form.role}
              onChange={(event) => setForm((previous) => ({ ...previous, role: event.target.value as UserRole }))}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small style={{ color: "#475467" }}>
              {ROLE_OPTIONS.find((option) => option.value === form.role)?.description}
            </small>
          </div>
          <button className={styles.primaryButton} type="submit" disabled={submitting}>
            {submitting ? "Sending token..." : "Send verification token"}
          </button>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#475467" }}>
            Already registered? <Link to="/login">Sign in</Link>.
          </p>
          {status ? <p className={styles.statusMessage}>{status}</p> : null}
          {successPayload ? (
            <p style={{ margin: 0, color: "#047857", fontWeight: 600 }}>
              Check your email for the verification token (valid for {successPayload.expires_in_minutes} minutes).{" "}
              <Link to={`/signup/verify?role=${form.role}`}>Enter token</Link>
            </p>
          ) : null}
        </form>
      </section>
    </div>
  );
}
