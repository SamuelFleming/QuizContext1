import { useState } from "react";
import { login, register } from "../lib/api.js";

export default function AuthPage({ onAuthenticated, navigate, path }) {
  const [mode, setMode] = useState(path === "/register" ? "register" : "login");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (isRegister && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setBusy(true);
    try {
      const result = isRegister
        ? await register({ email, displayName, password })
        : await login({ email, password });
      onAuthenticated(result);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setError("");
    setPassword("");
    navigate(next === "register" ? "/register" : "/login");
  }

  return (
    <main className="page">
      <section className="card auth-card" aria-live="polite">
        <p className="eyebrow">QuizContext</p>
        <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
        <p className="lede">
          {isRegister
            ? "Register to start organising your study material."
            : "Log in to continue to your dashboard."}
        </p>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          {isRegister ? (
            <label className="field">
              <span>Display name</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
                required
              />
            </label>
          ) : null}

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </label>
          {isRegister ? <p className="hint">At least 8 characters.</p> : null}

          {error ? (
            <p className="error-text" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={busy}>
            {busy ? "Please wait…" : isRegister ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="switch">
          {isRegister ? "Already have an account?" : "New to QuizContext?"}{" "}
          <button
            type="button"
            className="link"
            onClick={() => switchMode(isRegister ? "login" : "register")}
          >
            {isRegister ? "Log in" : "Create one"}
          </button>
        </p>
        <p className="switch">
          <button type="button" className="link" onClick={() => navigate("/diagnostics")}>
            Service status
          </button>
        </p>
      </section>
    </main>
  );
}
