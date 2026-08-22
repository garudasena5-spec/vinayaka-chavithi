"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "../../lib/api";
import styles from "./admin.module.css";

type Admin = { name: string; email: string };
type Contribution = { _id: string; contributorName: string; amount: number; date: string; isVisible: boolean };

const tokenKey = "garudasena-admin-token";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadDashboard = async (currentToken: string) => {
    const [currentAdmin, contributionData] = await Promise.all([
      api<Admin>("/api/admin/me", { token: currentToken }),
      api<Contribution[]>("/api/contributions", { token: currentToken }),
    ]);
    setAdmin(currentAdmin);
    setContributions(contributionData);
  };

  useEffect(() => {
    const savedToken = window.localStorage.getItem(tokenKey);
    if (!savedToken) return;

    setToken(savedToken);
    loadDashboard(savedToken).catch(() => window.localStorage.removeItem(tokenKey));
  }, []);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      const result = await api<{ token: string; admin: Admin }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      window.localStorage.setItem(tokenKey, result.token);
      setToken(result.token);
      await loadDashboard(result.token);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const addContribution = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      await api<Contribution>("/api/contributions", {
        method: "POST",
        token,
        body: JSON.stringify({
          contributorName: form.get("contributorName"),
          amount: Number(form.get("amount")),
          isVisible: true,
        }),
      });
      event.currentTarget.reset();
      setContributions(await api<Contribution[]>("/api/contributions", { token }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save contribution");
    }
  };

  const logout = () => {
    window.localStorage.removeItem(tokenKey);
    setToken("");
    setAdmin(null);
  };

  if (!admin) {
    return (
      <main className={styles.loginPage}>
        <form className={styles.loginCard} onSubmit={login}>
          <p>GARUDASENA</p>
          <h1>Admin panel</h1>
          <label>Email<input name="email" type="email" required autoComplete="email" /></label>
          <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
          {error && <span className={styles.error}>{error}</span>}
          <button disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        </form>
      </main>
    );
  }

  return (
    <main className={styles.dashboard}>
      <header>
        <div><p>GARUDASENA</p><h1>Content dashboard</h1></div>
        <div className={styles.user}><span>{admin.email}</span><button onClick={logout}>Sign out</button></div>
      </header>
      {error && <p className={styles.error}>{error}</p>}
      <section className={styles.stats}>
        <article><span>Contributions</span><strong>{contributions.length}</strong></article>
        <article><span>Total received</span><strong>₹{contributions.reduce((total, item) => total + item.amount, 0).toLocaleString("en-IN")}</strong></article>
        <article><span>Admin access</span><strong>Active</strong></article>
      </section>
      <section className={styles.panel}>
        <div className={styles.panelHeading}><div><p>CONTRIBUTIONS</p><h2>Add a contribution</h2></div></div>
        <form className={styles.contributionForm} onSubmit={addContribution}>
          <input name="contributorName" placeholder="Contributor name" required />
          <input name="amount" type="number" min="0" step="0.01" placeholder="Amount" required />
          <button>Add contribution</button>
        </form>
        <div className={styles.rows}>
          {contributions.map((item) => <div key={item._id}><span><b>{item.contributorName}</b><small>{new Date(item.date).toLocaleDateString("en-IN")}</small></span><strong>₹{item.amount.toLocaleString("en-IN")}</strong></div>)}
          {!contributions.length && <p>No contribution records yet.</p>}
        </div>
      </section>
    </main>
  );
}
