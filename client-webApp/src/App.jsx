import { useCallback, useEffect, useState } from "react";
import Shell from "./components/Shell.jsx";
import { clearToken, getMe, getToken, setToken } from "./lib/api.js";
import AuthPage from "./pages/AuthPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Diagnostics from "./pages/Diagnostics.jsx";
import Placeholder from "./pages/Placeholder.jsx";

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const navigate = useCallback((next) => {
    if (next !== window.location.pathname) {
      window.history.pushState({}, "", next);
    }
    setPath(next);
  }, []);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const loadUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setAuthChecked(true);
      return;
    }
    try {
      setUser(await getMe());
    } catch {
      // Invalid or expired token: drop it and fall back to the login screen.
      clearToken();
      setUser(null);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleAuthenticated = useCallback(
    (result) => {
      setToken(result.token);
      setUser(result.user);
      navigate("/");
    },
    [navigate],
  );

  const handleLogout = useCallback(() => {
    clearToken();
    setUser(null);
    navigate("/login");
  }, [navigate]);

  // Diagnostics stays reachable regardless of auth (Phase 1 connectivity screen).
  if (path === "/diagnostics") {
    const diagnostics = <Diagnostics onBack={() => navigate(user ? "/" : "/login")} />;
    if (user) {
      return (
        <Shell path={path} navigate={navigate} user={user} onLogout={handleLogout}>
          {diagnostics}
        </Shell>
      );
    }
    return <main className="page">{diagnostics}</main>;
  }

  if (!authChecked) {
    return (
      <main className="page">
        <section className="card">
          <p className="status-line">Loading…</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return <AuthPage onAuthenticated={handleAuthenticated} navigate={navigate} path={path} />;
  }

  let content;
  switch (path) {
    case "/subjects":
      content = (
        <Placeholder
          title="Subjects"
          message="Your subjects will appear here. Content management arrives in a later phase."
        />
      );
      break;
    case "/quizzes":
      content = (
        <Placeholder
          title="Quizzes"
          message="Your quizzes will appear here. Quiz features arrive in a later phase."
        />
      );
      break;
    case "/profile":
      content = (
        <Placeholder title="Profile" message="Profile editing arrives in a later phase." />
      );
      break;
    default:
      content = <Dashboard user={user} />;
  }

  return (
    <Shell path={path} navigate={navigate} user={user} onLogout={handleLogout}>
      {content}
    </Shell>
  );
}
