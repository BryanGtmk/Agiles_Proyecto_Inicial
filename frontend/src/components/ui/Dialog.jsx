import { X } from 'lucide-react';
import Button from './Button';

export default function Dialog({
  open,
  title,
  description,
  children,
  onClose,
  footer,
  panelClassName = '',
  contentClassName = '',
  footerClassName = ''
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <div className={`dialog-panel ${panelClassName}`.trim()} role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="dialog-header">
          <div>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
          </div>
          <Button variant="ghost" className="icon-button" onClick={onClose} type="button" aria-label="Cerrar dialogo">
            <X size={18} />
          </Button>
        </div>

        <div className={`dialog-content ${contentClassName}`.trim()}>{children}</div>

        {footer && <div className={`dialog-footer ${footerClassName}`.trim()}>{footer}</div>}
      </div>
    </div>
  );
}
