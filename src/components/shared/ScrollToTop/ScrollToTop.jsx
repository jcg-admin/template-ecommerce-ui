/**
 * ScrollToTop — ecommerce-ui
 * Restaura la posición al inicio en cada cambio de ruta.
 * Usar dentro de <BrowserRouter> para que useLocation funcione.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
