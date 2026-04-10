export default function StatCard({ label, value, hint, tone = 'neutral' }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <p>{hint}</p>}
    </article>
  );
}
