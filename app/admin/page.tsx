"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "../../lib/api";
import styles from "./admin.module.css";

type Admin = { name: string; email: string };
type Contribution = { _id: string; contributorName: string; amount: number; date: string; isVisible: boolean };
type Expense = { _id: string; category: string; amount: number; date: string; isVisible: boolean };
type EditingRecord = { type: "contribution"; item: Contribution } | { type: "expense"; item: Expense };

const tokenKey = "garudasena-admin-token";
const dateInputValue = (date: string) => new Date(date).toISOString().slice(0, 10);

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editing, setEditing] = useState<EditingRecord | null>(null);
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

  const refreshRecords = async (recordType: EditingRecord["type"]) => {
    if (recordType === "contribution") setContributions(await api<Contribution[]>("/api/contributions", { token }));
    else setExpenses(await api<Expense[]>("/api/expenses", { token }));
  };

  useEffect(() => {
    const savedToken = window.localStorage.getItem(tokenKey);
    if (!savedToken) return;
    setToken(savedToken);
    loadDashboard(savedToken).catch(() => window.localStorage.removeItem(tokenKey));
  }, []);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await api<{ token: string; admin: Admin }>("/api/admin/login", { method: "POST", body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      window.localStorage.setItem(tokenKey, result.token); setToken(result.token); await loadDashboard(result.token);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to sign in"); } finally { setLoading(false); }
  };

  const addContribution = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); const form = new FormData(event.currentTarget);
    try {
      await api<Contribution>("/api/contributions", { method: "POST", token, body: JSON.stringify({ contributorName: form.get("contributorName"), amount: Number(form.get("amount")), isVisible: true }) });
      event.currentTarget.reset(); await refreshRecords("contribution");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to save contribution"); }
  };

  const addExpense = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); const form = new FormData(event.currentTarget);
    try {
      await api<Expense>("/api/expenses", { method: "POST", token, body: JSON.stringify({ category: form.get("category"), amount: Number(form.get("amount")), isVisible: true }) });
      event.currentTarget.reset(); await refreshRecords("expense");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to save expense"); }
  };

  const updateRecord = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!editing) return;
    setError(""); setLoading(true); const form = new FormData(event.currentTarget); const isContribution = editing.type === "contribution";
    try {
      await api(isContribution ? `/api/contributions/${editing.item._id}` : `/api/expenses/${editing.item._id}`, { method: "PUT", token, body: JSON.stringify({ ...(isContribution ? { contributorName: form.get("name") } : { category: form.get("name") }), amount: Number(form.get("amount")), date: form.get("date"), isVisible: form.get("isVisible") === "on" }) });
      await refreshRecords(editing.type); setEditing(null);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to update record"); } finally { setLoading(false); }
  };

  const logout = () => { window.localStorage.removeItem(tokenKey); setToken(""); setAdmin(null); setEditing(null); };

  if (!admin) return <main className={styles.loginPage}><form className={styles.loginCard} onSubmit={login}><p>GARUDASENA</p><h1>Admin panel</h1><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Password<input name="password" type="password" required autoComplete="current-password" /></label>{error && <span className={styles.error}>{error}</span>}<button disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button></form></main>;

  return <main className={styles.dashboard}>
    <header><div><p>GARUDASENA</p><h1>Content dashboard</h1></div><div className={styles.user}><span>{admin.email}</span><button onClick={logout}>Sign out</button></div></header>
    {error && <p className={styles.error}>{error}</p>}
    <section className={styles.stats}><article><span>Contributions</span><strong>{contributions.length}</strong></article><article><span>Total received</span><strong>₹{contributions.reduce((total, item) => total + item.amount, 0).toLocaleString("en-IN")}</strong></article><article><span>Total spent</span><strong>₹{expenses.reduce((total, item) => total + item.amount, 0).toLocaleString("en-IN")}</strong></article></section>
    <section className={styles.panel}>
      <div className={styles.panelHeading}><div><p>SPENDING</p><h2>Add an expense category</h2></div></div>
      <form className={styles.contributionForm} onSubmit={addExpense}><input name="category" placeholder="Category (e.g. Decorations)" required /><input name="amount" type="number" min="0" step="0.01" placeholder="Amount spent" required /><button>Add expense</button></form>
      <div className={styles.rows}>{expenses.map((item) => <div key={item._id}><span><b>{item.category}</b><small>{new Date(item.date).toLocaleDateString("en-IN")}</small></span><strong>₹{item.amount.toLocaleString("en-IN")}</strong><button type="button" onClick={() => setEditing({ type: "expense", item })}>Edit</button></div>)}{!expenses.length && <p>No spending records yet.</p>}</div>
    </section>
    <section className={styles.panel}>
      <div className={styles.panelHeading}><div><p>CONTRIBUTIONS</p><h2>Add a contribution</h2></div></div>
      <form className={styles.contributionForm} onSubmit={addContribution}><input name="contributorName" placeholder="Contributor name" required /><input name="amount" type="number" min="0" step="0.01" placeholder="Amount" required /><button>Add contribution</button></form>
      <div className={styles.rows}>{contributions.map((item) => <div key={item._id}><span><b>{item.contributorName}</b><small>{new Date(item.date).toLocaleDateString("en-IN")}</small></span><strong>₹{item.amount.toLocaleString("en-IN")}</strong><button type="button" onClick={() => setEditing({ type: "contribution", item })}>Edit</button></div>)}{!contributions.length && <p>No contribution records yet.</p>}</div>
    </section>
    {editing && <div className={styles.modalBackdrop} role="presentation"><form className={styles.editCard} onSubmit={updateRecord}><div className={styles.editHeading}><h2>Edit {editing.type === "contribution" ? "contribution" : "expense"}</h2><button type="button" onClick={() => setEditing(null)} aria-label="Close edit form">×</button></div><label>{editing.type === "contribution" ? "Contributor name" : "Category"}<input name="name" defaultValue={editing.type === "contribution" ? editing.item.contributorName : editing.item.category} required /></label><label>Amount<input name="amount" type="number" min="0" step="0.01" defaultValue={editing.item.amount} required /></label><label>Date<input name="date" type="date" defaultValue={dateInputValue(editing.item.date)} required /></label><label className={styles.visibility}><input name="isVisible" type="checkbox" defaultChecked={editing.item.isVisible} /> Show on public website</label><div className={styles.editActions}><button type="button" onClick={() => setEditing(null)}>Cancel</button><button disabled={loading}>{loading ? "Saving..." : "Save changes"}</button></div></form></div>}
  </main>;
}
