import { useEffect, useMemo, useState } from 'react';

const ROUTES = ['dashboard', 'clientes', 'productos', 'nueva-factura', 'historial', 'configuracion'];

function normalizeRoute(value) {
  const raw = String(value || '').replace(/^#\/?/, '').replace(/^\//, '');
  return ROUTES.includes(raw) ? raw : 'dashboard';
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => normalizeRoute(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(normalizeRoute(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);

    if (!window.location.hash) {
      window.location.hash = '#/dashboard';
    }

    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useMemo(() => {
    return (nextRoute) => {
      const normalized = normalizeRoute(nextRoute);
      if (window.location.hash !== `#/${normalized}`) {
        window.location.hash = `#/${normalized}`;
      }
    };
  }, []);

  return { route, navigate };
}
