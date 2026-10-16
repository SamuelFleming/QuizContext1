export default function Dashboard({ user }) {
  return (
    <section className="card">
      <p className="eyebrow">Dashboard</p>
      <h1>Welcome, {user.displayName}</h1>
      <p className="lede">You are signed in to QuizContext.</p>
      <ul className="detail-list">
        <li>
          <span>Display name</span>
          <span>{user.displayName}</span>
        </li>
        <li>
          <span>Email</span>
          <span>{user.email}</span>
        </li>
      </ul>
      <p className="detail">
        Subjects, quizzes, and profile settings arrive in later phases.
      </p>
    </section>
  );
}
