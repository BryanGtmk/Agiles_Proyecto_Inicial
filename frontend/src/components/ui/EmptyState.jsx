import Button from './Button';

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state-card">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} type="button">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
