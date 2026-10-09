import { useEffect, useState } from "react";

const apiBaseUrl = import.meta.env.VITE_WEB_API_BASE_URL || "http://localhost:4017";

const rows = [
  ["webApp", "Business API"],
  ["dataApi", "Data API"],
  ["database", "Database"],
];

const failedStatus = {
  webApp: "failed",
  dataApi: "failed",
  database: "failed",
};

async function requestConnectivity() {
  const response = await fetch(`${apiBaseUrl}/diagnostics/connectivity`);
  if (!response.ok) {
    throw new Error("The business API returned an error.");
  }
  const body = await response.json();
  return {
    webApp: body?.data?.webApp === "ok" ? "ok" : "failed",
    dataApi: body?.data?.dataApi === "ok" ? "ok" : "failed",
    database: body?.data?.database === "ok" ? "ok" : "failed",
  };
}

export default function App() {
  const [status, setStatus] = useState(null);
  const [phase, setPhase] = useState("loading");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    let cancelled = false;
    requestConnectivity()
      .then((nextStatus) => {
        if (cancelled) return;
        setStatus(nextStatus);
        setPhase("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus(failedStatus);
        setDetail("The business API could not be reached.");
        setPhase("ready");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function checkAgain() {
    setPhase("loading");
    setDetail("");
    try {
      setStatus(await requestConnectivity());
    } catch {
      setStatus(failedStatus);
      setDetail("The business API could not be reached.");
    }
    setPhase("ready");
  }

  return (
    <main className="page">
      <section className="card" aria-live="polite">
        <p className="eyebrow">QuizContext</p>
        <h1>Service connectivity</h1>
        <p className="lede">
          This check runs from the browser through the business API to the data API and MongoDB.
        </p>
        {phase === "loading" ? <p className="status-line">Checking connectivity…</p> : null}
        {phase === "ready" && status ? (
          <ul className="status-list">
            {rows.map(([key, label]) => (
              <li key={key}>
                <span>{label}</span>
                <span className={status[key] === "ok" ? "pill ok" : "pill failed"}>
                  {status[key] === "ok" ? "OK" : "Failed"}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {detail ? <p className="detail">{detail}</p> : null}
        <button type="button" onClick={checkAgain} disabled={phase === "loading"}>
          Check again
        </button>
      </section>
    </main>
  );
}
