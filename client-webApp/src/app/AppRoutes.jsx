import Placeholder from "../components/Placeholder.jsx";
import Shell from "../components/layout/Shell.jsx";
import { useAuth } from "../context/useAuth.js";
import AuthPage from "../features/auth/AuthPage.jsx";
import Dashboard from "../features/dashboard/Dashboard.jsx";
import Diagnostics from "../features/diagnostics/Diagnostics.jsx";
import ProfilePage from "../features/profile/ProfilePage.jsx";

export default function AppRoutes({ path, navigate }) {
  const { user, authChecked } = useAuth();

  // Diagnostics stays reachable regardless of auth (Phase 1 connectivity screen).
  if (path === "/diagnostics") {
    const diagnostics = <Diagnostics onBack={() => navigate(user ? "/" : "/login")} />;
    if (user) {
      return (
        <Shell path={path} navigate={navigate}>
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
    return <AuthPage navigate={navigate} path={path} />;
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
      content = <ProfilePage />;
      break;
    default:
      content = <Dashboard />;
  }

  return (
    <Shell path={path} navigate={navigate}>
      {content}
    </Shell>
  );
}
