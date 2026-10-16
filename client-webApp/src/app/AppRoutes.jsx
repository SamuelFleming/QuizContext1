import Shell from "../components/layout/Shell.jsx";
import { useAuth } from "../context/useAuth.js";
import AuthPage from "../features/auth/AuthPage.jsx";
import ContentWorkspace from "../features/content/ContentWorkspace.jsx";
import SubjectsPage from "../features/content/SubjectsPage.jsx";
import Dashboard from "../features/dashboard/Dashboard.jsx";
import Diagnostics from "../features/diagnostics/Diagnostics.jsx";
import ProfilePage from "../features/profile/ProfilePage.jsx";
import QuizDetailPage from "../features/quizzes/QuizDetailPage.jsx";
import QuizPlayerPage from "../features/quizzes/QuizPlayerPage.jsx";
import QuizGeneratePage from "../features/quizzes/QuizGeneratePage.jsx";
import QuizzesHome from "../features/quizzes/QuizzesHome.jsx";

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
  const attemptMatch = path.match(/^\/attempts\/([^/]+)$/);
  const quizMatch = path === "/quizzes/new" ? null : path.match(/^\/quizzes\/([^/]+)$/);
  const route = subjectMatch
    ? "/subjects/:subjectId"
    : attemptMatch
      ? "/attempts/:attemptId"
      : quizMatch
        ? "/quizzes/:quizId"
        : path;

  let content;
  switch (route) {
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
    case "/attempts/:attemptId":
      content = (
        <QuizPlayerPage
          key={attemptMatch[1]}
          attemptId={decodeURIComponent(attemptMatch[1])}
          navigate={navigate}
        />
      );
      break;
    case "/quizzes/new":
      content = <QuizGeneratePage navigate={navigate} />;
      break;
    case "/quizzes/:quizId":
      content = (
        <QuizDetailPage
          key={quizMatch[1]}
          quizId={decodeURIComponent(quizMatch[1])}
          navigate={navigate}
        />
      );
      break;
    case "/quizzes":
      content = <QuizzesHome navigate={navigate} />;
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
