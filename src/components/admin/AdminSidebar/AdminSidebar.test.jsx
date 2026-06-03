/**
 * Tests AdminSidebar — fuente unica de la nav del panel admin.
 *
 * Verifica que cada ruta admin navegable tenga su entrada con el `to`
 * correcto. Cubre el cableado de rutas antes huerfanas (iniciativa
 * cablear-rutas-huerfanas, F2): couriers, permissions, backups,
 * orders-dashboard, price-sync, product-discounts, notifications/compose,
 * newsletter/subscribers, newsletter/compose, questions/answer,
 * questions/moderation, reviews/moderation.
 */
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminSidebar from './index';

function renderSidebar() {
  return render(
    <MemoryRouter>
      <AdminSidebar />
    </MemoryRouter>,
  );
}

describe('AdminSidebar — entradas de navegacion', () => {
  // Rutas antes huerfanas, cableadas en F2.
  it.each([
    ['Panel de pedidos',     '/admin/orders-dashboard'],
    ['Descuentos',           '/admin/product-discounts'],
    ['Mensajeros',           '/admin/couriers'],
    ['Sincronizar precios',  '/admin/price-sync'],
    ['Permisos',             '/admin/permissions'],
    ['Respaldos',            '/admin/backups'],
    ['Enviar notificacion',  '/admin/notifications/compose'],
    ['Suscriptores',         '/admin/newsletter/subscribers'],
    ['Redactar boletin',     '/admin/newsletter/compose'],
    ['Responder preguntas',  '/admin/questions/answer'],
    ['Moderar preguntas',    '/admin/questions/moderation'],
    ['Moderar resenas',      '/admin/reviews/moderation'],
  ])('expone el link "%s" hacia %s', (label, href) => {
    renderSidebar();
    const nav  = screen.getByRole('navigation');
    const link = within(nav).getByRole('link', { name: new RegExp(`^${label}$`, 'i') });
    expect(link).toHaveAttribute('href', href);
  });
});
