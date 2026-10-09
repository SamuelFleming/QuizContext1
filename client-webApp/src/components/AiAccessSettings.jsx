import { useEffect, useState } from "react";
import {
  checkAiConnection,
  getAiSettings,
  removeAiKey,
  saveAiKey,
  setAiMode,
} from "../lib/api.js";

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "";
}

export default function AiAccessSettings({ onUnauthorized, onChecked }) {
  const [settings, setSettings] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [check, setCheck] = useState({ state: "idle", message: "" });

  async function handleCheck() {
    setCheck({ state: "running", message: "" });
    try {
      const result = await checkAiConnection();
      const source = result.providerMode === "user" ? "your key" : "the application key";
      setCheck({
        state: "ok",
        message: `Connected using ${source} (${result.model}, ${result.latencyMs} ms).`,
      });
    } catch (err) {
      if (err.status === 401 && !err.code) {
        onUnauthorized();
        return;
      }
      setCheck({ state: "error", message: err.message || "The connection test failed." });
    } finally {
      onChecked?.();
    }
  }

  useEffect(() => {
    let cancelled = false;
    getAiSettings()
      .then((next) => {
        if (!cancelled) setSettings(next);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) onUnauthorized();
        else setError(err.message || "Could not load AI settings.");
      });
    return () => {
      cancelled = true;
    };
  }, [onUnauthorized]);

  async function run(action, successMessage) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      setSettings(await action());
      setNotice(successMessage);
      return true;
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized();
        return false;
      }
      setError(err.message || "Something went wrong.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveKey(event) {
    event.preventDefault();
    const ok = await run(() => saveAiKey(apiKey), "Key saved.");
    if (ok) setApiKey("");
  }

  if (!settings) {
    return (
      <section className="card" aria-live="polite">
        <p className="eyebrow">AI access</p>
        {error ? <p className="error-text" role="alert">{error}</p> : <p className="status-line">Loading…</p>}
      </section>
    );
  }

  const usingOwnKey = settings.aiAccessMode === "user";

  return (
    <section className="card" aria-live="polite">
      <p className="eyebrow">AI access</p>
      <h2>OpenAI access</h2>

      <fieldset className="choice-group" disabled={busy}>
        <legend>Which key should QuizContext use?</legend>
        <label className="choice">
          <input
            type="radio"
            name="aiAccessMode"
            checked={!usingOwnKey}
            onChange={() => run(() => setAiMode("application"), "Using the application key.")}
          />
          <span>Application-provided key</span>
        </label>
        <label className="choice">
          <input
            type="radio"
            name="aiAccessMode"
            checked={usingOwnKey}
            onChange={() => run(() => setAiMode("user"), "Using your own key.")}
          />
          <span>My own OpenAI key</span>
        </label>
      </fieldset>

      <p className="key-status">
        {settings.hasUserKey
          ? `Key set (updated ${formatDate(settings.keyUpdatedAt)})`
          : "No personal key stored."}
      </p>
      {usingOwnKey && !settings.hasUserKey ? (
        <p className="hint">Add a key below before running AI features with your own access.</p>
      ) : null}

      <form className="form" onSubmit={handleSaveKey} noValidate>
        <label className="field">
          <span>{settings.hasUserKey ? "Replace key" : "OpenAI API key"}</span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoComplete="off"
            placeholder="sk-…"
          />
        </label>
        <div className="button-row">
          <button type="submit" disabled={busy || !apiKey}>
            {settings.hasUserKey ? "Replace key" : "Save key"}
          </button>
          {settings.hasUserKey ? (
            <button
              type="button"
              className="link"
              disabled={busy}
              onClick={() => run(removeAiKey, "Key removed.")}
            >
              Remove key
            </button>
          ) : null}
        </div>
      </form>

      {error ? <p className="error-text" role="alert">{error}</p> : null}
      {notice ? <p className="success-text" role="status">{notice}</p> : null}

      <div className="check-row">
        <button type="button" onClick={handleCheck} disabled={busy || check.state === "running"}>
          {check.state === "running" ? "Testing…" : "Test connection"}
        </button>
        {check.state === "ok" ? <p className="success-text" role="status">{check.message}</p> : null}
        {check.state === "error" ? <p className="error-text" role="alert">{check.message}</p> : null}
      </div>
    </section>
  );
}
