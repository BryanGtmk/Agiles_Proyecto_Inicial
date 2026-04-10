export default function SectionHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="section-actions">{actions}</div>}
    </div>
  );
}
