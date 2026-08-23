"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "../../lib/api";
import styles from "./admin.module.css";

type Admin = { name: string; email: string };
type Contribution = { _id: string; contributorName: string; amount: number; date: string; isVisible: boolean };
type Expense = { _id: string; category: string; amount: number; date: string; isVisible: boolean };

const tokenKey = "garudasena-admin-token";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadDashboard = async (currentToken: string) => {
    const [currentAdmin, contributionData, expenseData] = await Promise.all([
      api<Admin>("/api/admin/me", { token: currentToken }),
      api<Contribution[]>("/api/contributions", { token: currentToken }),
      api<Expense[]>("/api/expenses", { token: currentToken }),
    ]);
    setAdmin(currentAdmin);
    setContributions(contributionData);
    setExpenses(expenseData);
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

  const addExpense = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await api<Expense>("/api/expenses", {
        method: "POST",
        token,
        body: JSON.stringify({ category: form.get("category"), amount: Number(form.get("amount")), isVisible: true }),
      });
      event.currentTarget.reset();
      setExpenses(await api<Expense[]>("/api/expenses", { token }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save expense");
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
        <article><span>Total spent</span><strong>₹{expenses.reduce((total, item) => total + item.amount, 0).toLocaleString("en-IN")}</strong></article>
      </section>
      <section className={styles.panel}>
        <div className={styles.panelHeading}><div><p>SPENDING</p><h2>Add an expense category</h2></div></div>
        <form className={styles.contributionForm} onSubmit={addExpense}>
          <input name="category" placeholder="Category (e.g. Decorations)" required />
          <input name="amount" type="number" min="0" step="0.01" placeholder="Amount spent" required />
          <button>Add expense</button>
        </form>
        <div className={styles.rows}>
          {expenses.map((item) => <div key={item._id}><span><b>{item.category}</b><small>{new Date(item.date).toLocaleDateString("en-IN")}</small></span><strong>₹{item.amount.toLocaleString("en-IN")}</strong></div>)}
          {!expenses.length && <p>No spending records yet.</p>}
        </div>
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
