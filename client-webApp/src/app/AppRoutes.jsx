import Placeholder from "../components/Placeholder.jsx";
import Shell from "../components/layout/Shell.jsx";
import { useAuth } from "../context/useAuth.js";
import AuthPage from "../features/auth/AuthPage.jsx";
import ContentWorkspace from "../features/content/ContentWorkspace.jsx";
import SubjectsPage from "../features/content/SubjectsPage.jsx";
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

  const subjectMatch = path.match(/^\/subjects\/([^/]+)$/);

  let content;
  switch (subjectMatch ? "/subjects/:subjectId" : path) {
    case "/subjects":
      content = <SubjectsPage navigate={navigate} />;
      break;
    case "/subjects/:subjectId":
      content = (
        <ContentWorkspace
          key={subjectMatch[1]}
          subjectId={decodeURIComponent(subjectMatch[1])}
          navigate={navigate}
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
      content = <Dashboard navigate={navigate} />;
  }

  return (
    <Shell path={path} navigate={navigate} wide={Boolean(subjectMatch)}>
      {content}
    </Shell>
  );
}
