import { FormEvent, useState } from "react";
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
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Verification failed";
      setStatus(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.appShell}>
      <section className={styles.authWrapper}>
        <header className={styles.authHeader}>
          <h1>Verify your email</h1>
          <p>
            Paste the token we sent to your inbox{roleHint ? (
              <>
                {" "}
                for the <strong>{roleHint.replace("_", " ")}</strong> role
              </>
            ) : null}
            .
          </p>
        </header>
        <form className={styles.loginCard} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="token">Verification token</label>
            <input
              id="token"
              className={styles.textInput}
              value={form.token}
              onChange={(event) => setForm((previous) => ({ ...previous, token: event.target.value }))}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password (optional)</label>
            <input
              id="password"
              type="password"
              className={styles.textInput}
              placeholder="Set a password to allow email-based login"
              value={form.password}
              onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="first_name">First name</label>
            <input
              id="first_name"
              className={styles.textInput}
              value={form.first_name}
              onChange={(event) => setForm((previous) => ({ ...previous, first_name: event.target.value }))}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="last_name">Last name</label>
            <input
              id="last_name"
              className={styles.textInput}
              value={form.last_name}
              onChange={(event) => setForm((previous) => ({ ...previous, last_name: event.target.value }))}
            />
          </div>
          <label className={styles.formGroup}>
            <span>
              <input
                type="checkbox"
                checked={form.remember_me}
                onChange={(event) => setForm((previous) => ({ ...previous, remember_me: event.target.checked }))}
              />{" "}
              Keep me signed in after verification
            </span>
          </label>
          <button className={styles.primaryButton} type="submit" disabled={submitting}>
            {submitting ? "Completing signup..." : "Complete signup"}
          </button>
          {status ? <p className={styles.statusMessage}>{status}</p> : null}
        </form>
      </section>
    </div>
  );
}
