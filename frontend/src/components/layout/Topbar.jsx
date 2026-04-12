import { Menu, Wrench } from 'lucide-react';
import Button from '../ui/Button';

const titles = {
  dashboard: 'Dashboard',
  clientes: 'Clientes',
  productos: 'Productos',
  'nueva-factura': 'Nueva Factura',
  historial: 'Historial',
  configuracion: 'Configuracion'
};

export default function Topbar({ route, onMenuClick }) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <Button variant="ghost" className="icon-button topbar-menu-button" onClick={onMenuClick} type="button" aria-label="Abrir menu">
          <Menu size={18} />
        </Button>
        <div className="topbar-brand-mark" aria-hidden="true">
          <Wrench size={14} />
        </div>
        <div>
          <p>Panel</p>
          <h1>{titles[route] || 'Dashboard'}</h1>
        </div>
      </div>
    </header>
  );
}
