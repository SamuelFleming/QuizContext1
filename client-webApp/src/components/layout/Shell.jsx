import { useAuth } from "../../context/useAuth.js";

const LINKS = [
  ["/", "Dashboard"],
  ["/subjects", "Subjects"],
  ["/quizzes", "Quizzes"],
  ["/profile", "Profile"],
];

function isActive(path, to) {
  return to === "/" ? path === "/" : path === to || path.startsWith(`${to}/`);
}

export default function Shell({ path, navigate, wide = false, children }) {
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
                className={isActive(path, to) ? "nav-link active" : "nav-link"}
                aria-current={isActive(path, to) ? "page" : undefined}
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
      <main className={wide ? "shell-main wide" : "shell-main"}>{children}</main>
    </div>
  );
}
