import { useAuth } from "../../context/useAuth.js";

const LINKS = [
  ["/", "Dashboard"],
  ["/subjects", "Subjects"],
  ["/quizzes", "Quizzes"],
  ["/profile", "Profile"],
];

export default function Shell({ path, navigate, children }) {
  const { user, signOut } = useAuth();
  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-bar">
          <button type="button" className="brand" onClick={() => navigate("/")}>
            QuizContext
          </button>
          <nav className="shell-nav" aria-label="Primary">
            {LINKS.map(([to, label]) => (
              <button
                key={to}
                type="button"
                className={path === to ? "nav-link active" : "nav-link"}
                aria-current={path === to ? "page" : undefined}
                onClick={() => navigate(to)}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="shell-user">
            <span className="shell-user-name">{user.displayName}</span>
            <button type="button" className="link" onClick={signOut}>
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="shell-main">{children}</main>
    </div>
  );
}
