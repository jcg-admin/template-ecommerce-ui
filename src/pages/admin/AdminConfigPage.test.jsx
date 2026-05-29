/**
 * Tests — AdminConfigPage (Hub UC-CFG-*)
 *
 * El hub no consume endpoints; solo enlaza a las paginas que ya
 * implementan cada subdominio de configuracion (CFG-01..05).
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import AdminConfigPage from './AdminConfigPage';

describe('AdminConfigPage (hub de configuracion)', () => {
  it('renderiza el titulo Configuracion', () => {
    render(
      <MemoryRouter>
        <AdminConfigPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /^Configuracion$/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it('expone enlaces a los cinco dominios de configuracion', () => {
    render(
      <MemoryRouter>
        <AdminConfigPage />
      </MemoryRouter>,
    );
    // UC-CFG-03 (SiteSettings)
    expect(
      screen.getByRole('link', { name: /Configuracion del Sistema/i }),
    ).toHaveAttribute('href', '/admin/system-settings');
    // UC-CFG-05 — datos de contacto
    expect(
      screen.getByRole('link', { name: /Mensajes de contacto/i }),
    ).toHaveAttribute('href', '/admin/contact/messages');
    // UC-CFG-01 — gateways de pago
    expect(
      screen.getByRole('link', { name: /Gateways y pagos/i }),
    ).toHaveAttribute('href', '/admin/payments');
    // UC-CFG-04 — contenido estatico (ahora tiene ruta /admin/pages)
    expect(
      screen.getByRole('link', { name: /Gestionar contenido estatico/i }),
    ).toHaveAttribute('href', '/admin/pages');
    // UC-CFG-02 — metodos y costos de envio
    expect(
      screen.getByRole('link', { name: /Metodos y costos de envio/i }),
    ).toHaveAttribute('href', '/admin/logistics');
  });

  it('todos los items del hub son enlaces activos', () => {
    render(
      <MemoryRouter>
        <AdminConfigPage />
      </MemoryRouter>,
    );
    // No debe haber divs con aria-disabled (la tarjeta pendiente fue habilitada)
    const disabledItems = document.querySelectorAll('[aria-disabled="true"]');
    expect(disabledItems.length).toBe(0);
  });
});
