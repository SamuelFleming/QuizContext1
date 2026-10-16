export default function Placeholder({ title, message }) {
  return (
    <section className="card">
      <p className="eyebrow">{title}</p>
      <h1>{title}</h1>
      <p className="lede">{message}</p>
    </section>
  );
}
