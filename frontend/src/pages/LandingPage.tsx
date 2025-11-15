import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import styles from "../App.module.css";

export function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className={styles.appShell}>
      <section className={styles.authWrapper}>
        <header className={styles.authHeader}>
          <h1>Welcome to Healteex</h1>
          <p>
            A unified workspace for pharmacists, policymakers, and administrators to forecast demand, manage stock, and
            keep facilities supplied.
          </p>
        </header>
        <div className={styles.actionsRow}>
          {isAuthenticated ? (
            <>
              <p>
                Signed in as <strong>{user?.email}</strong>. Ready to continue?
              </p>
              <Link className={styles.primaryButton} to="/dashboard">
                Enter dashboard
              </Link>
            </>
          ) : (
            <>
              <Link className={styles.primaryButton} to="/login">
                Sign in
              </Link>
              <Link className={styles.secondaryButton} to="/signup">
                Create an account
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
