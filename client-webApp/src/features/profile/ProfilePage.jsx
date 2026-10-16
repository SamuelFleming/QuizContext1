import { useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { updateMe } from "../../services/userService.js";
import AiAccessSettings from "./AiAccessSettings.jsx";
import UsagePanel from "./UsagePanel.jsx";

export default function ProfilePage() {
  const { user, updateUser, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [usageVersion, setUsageVersion] = useState(0);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");
    try {
      const updated = await updateMe({ displayName });
      updateUser(updated);
      setDisplayName(updated.displayName);
      setStatus("saved");
      setMessage("Profile saved.");
    } catch (err) {
      if (err.status === 401) {
        signOut();
        return;
      }
      setStatus("error");
      setMessage(err.message || "Could not save the profile.");
    }
  }

  return (
    <div className="stack">
      <section className="card" aria-live="polite">
        <p className="eyebrow">Profile</p>
        <h1>Your profile</h1>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>Email</span>
            <input type="email" value={user.email} readOnly disabled />
          </label>
          <label className="field">
            <span>Display name</span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80}
              autoComplete="name"
              required
            />
          </label>
          {message ? (
            <p
              className={status === "error" ? "error-text" : "success-text"}
              role={status === "error" ? "alert" : "status"}
            >
              {message}
            </p>
          ) : null}
          <button type="submit" disabled={status === "saving"}>
            {status === "saving" ? "Saving…" : "Save profile"}
          </button>
        </form>
      </section>
      <AiAccessSettings onChecked={() => setUsageVersion((v) => v + 1)} />
      <UsagePanel refreshKey={usageVersion} />
    </div>
  );
}
