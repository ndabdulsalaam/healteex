import { FormEvent, useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import styles from "../App.module.css";
import type { UserRole } from "../types";
import { GoogleSignInButton } from "../components/GoogleSignInButton";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
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
    role: "" as UserRole | "",
    remember_me: true,
  });
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: "email" | "password" | "role" | "remember_me", value: string | boolean) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
      const redirectTo = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in";
      setStatus(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setSubmitting(true);
      setStatus(null);
      try {
        await signInWithGoogle({
          id_token: credential,
          remember_me: form.remember_me,
          role: form.role || undefined,
        });
        navigate("/dashboard", { replace: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Google sign-in failed";
        setStatus(message);
      } finally {
        setSubmitting(false);
      }
    },
    [form.remember_me, form.role, navigate, signInWithGoogle]
  );

  return (
    <div className={styles.appShell}>
      <section className={styles.authWrapper}>
        <header className={styles.authHeader}>
          <h1>Sign in to Healteex</h1>
          <p>Access forecasts, inventory dashboards, and integration tools tailored to your role.</p>
        </header>
        <form className={styles.loginCard} onSubmit={onSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={styles.textInput}
              autoComplete="email"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={styles.textInput}
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => handleChange("password", event.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="role">Role (needed if this email has multiple accounts)</label>
            <select
              id="role"
              className={styles.selectInput}
              value={form.role}
              onChange={(event) => handleChange("role", event.target.value as UserRole | "")}
            >
              <option value="">Any role</option>
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <label className={styles.formGroup}>
            <span>
              <input
                type="checkbox"
                checked={form.remember_me}
                onChange={(event) => handleChange("remember_me", event.target.checked)}
              />{" "}
              Keep me signed in on this device
            </span>
          </label>
          <button className={styles.primaryButton} type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Continue"}
          </button>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <GoogleSignInButton onCredential={handleGoogleCredential} disabled={submitting} />
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#475467" }}>
              Don&apos;t have an account? <a href="/signup">Start signup</a>.
            </p>
          </div>
          {status ? <p className={styles.statusMessage}>{status}</p> : null}
        </form>
      </section>
    </div>
  );
}
