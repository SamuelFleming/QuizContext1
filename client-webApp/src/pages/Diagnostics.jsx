import { useCallback, useEffect, useState } from "react";
import { getConnectivity } from "../lib/api.js";

const rows = [
  ["webApp", "Business API"],
  ["dataApi", "Data API"],
  ["database", "Database"],
];

const failedStatus = { webApp: "failed", dataApi: "failed", database: "failed" };

function normalize(data) {
  return {
    webApp: data?.webApp === "ok" ? "ok" : "failed",
    dataApi: data?.dataApi === "ok" ? "ok" : "failed",
    database: data?.database === "ok" ? "ok" : "failed",
  };
}

export default function Diagnostics({ onBack }) {
  const [status, setStatus] = useState(null);
  const [phase, setPhase] = useState("loading");
  const [detail, setDetail] = useState("");

  const check = useCallback(async () => {
    setPhase("loading");
    setDetail("");
    try {
      setStatus(normalize(await getConnectivity()));
    } catch {
      setStatus(failedStatus);
      setDetail("The business API could not be reached.");
    }
    setPhase("ready");
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return (
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
      <div className="button-row">
        <button type="button" onClick={check} disabled={phase === "loading"}>
          Check again
        </button>
        {onBack ? (
          <button type="button" className="link" onClick={onBack}>
            Back
          </button>
        ) : null}
      </div>
    </section>
  );
}
