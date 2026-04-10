import { Menu, Search } from 'lucide-react';
import Button from '../ui/Button';

const titles = {
  dashboard: 'Dashboard',
  clientes: 'Clientes',
  productos: 'Productos',
  'nueva-factura': 'Nueva Factura',
  historial: 'Historial',
  configuracion: 'Configuracion'
};

export default function Topbar({ route, onMenuClick, settings }) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <Button variant="ghost" className="icon-button topbar-menu-button" onClick={onMenuClick} type="button" aria-label="Abrir menu">
          <Menu size={18} />
        </Button>
        <div>
          <p>Modulo administrativo</p>
          <h1>{titles[route] || 'Dashboard'}</h1>
        </div>
      </div>

      <div className="topbar-search">
        <Search size={16} />
        <span>{settings.nombreNegocio}</span>
      </div>
    </header>
  );
}
