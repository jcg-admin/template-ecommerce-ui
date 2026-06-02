/**
 * Tests — AdminSystemSettingsPage (UC-ADM-04)
 *
 *   GET   /api/v1/config/settings/
 *   PATCH /api/v1/config/settings/
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), patch: jest.fn(), post: jest.fn() },
}));

import apiService from '@services/apiService';
import settingsReducer from '@redux/slices/settingsSlice';
import AdminSystemSettingsPage from './AdminSystemSettingsPage';

const SETTINGS = {
  site_name: 'ecommerce-ui',
  support_email: 'hola@example.com',
  phone: '+52 55 0000 0000',
  address: 'Av. Reforma 123',
  tax_rate: 16,
  currency: 'MXN',
  maintenance_mode: false,
  social_links: { facebook: 'https://facebook.com/demo', instagram: '', youtube: '' },
};

const wrap = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const store = configureStore({ reducer: { settings: settingsReducer } });
  return (
    <QueryClientProvider client={client}>
      <Provider store={store}>
        <AdminSystemSettingsPage />
      </Provider>
    </QueryClientProvider>
  );
};

afterEach(() => jest.clearAllMocks());

describe('AdminSystemSettingsPage (UC-ADM-04)', () => {
  it('carga los settings actuales', async () => {
    apiService.get.mockResolvedValue({ data: SETTINGS });
    render(wrap());
    expect(
      await screen.findByRole('heading', { name: /Configuracion del Sistema/i }),
    ).toBeInTheDocument();
    expect(await screen.findByDisplayValue('ecommerce-ui')).toBeInTheDocument();
    expect(screen.getByDisplayValue('hola@example.com')).toBeInTheDocument();
  });

  // UC-CFG-05 — datos de contacto + redes sociales
  it('expone los campos de contacto y redes (UC-CFG-05)', async () => {
    apiService.get.mockResolvedValue({ data: SETTINGS });
    render(wrap());
    await screen.findByDisplayValue('ecommerce-ui');
    expect(screen.getByLabelText(/Email de soporte/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Direccion del negocio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Facebook$/i)).toHaveValue('https://facebook.com/demo');
    expect(screen.getByLabelText(/^Instagram$/i)).toBeInTheDocument();
  });

  it('envia PATCH /api/v1/config/settings/ con los cambios', async () => {
    apiService.get.mockResolvedValue({ data: SETTINGS });
    apiService.patch.mockResolvedValue({ data: SETTINGS });

    render(wrap());
    const input = await screen.findByDisplayValue('ecommerce-ui');
    fireEvent.change(input, { target: { value: 'ecommerce-ui MX' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => {
      expect(apiService.patch).toHaveBeenCalledWith(
        '/api/v1/config/settings/',
        expect.objectContaining({ site_name: 'ecommerce-ui MX' }),
      );
    });
  });

  // Campos del contrato MSW migrados desde AdminSiteSettingsPage (DR-02).
  it('expone los campos de contrato site_description, envio y guest checkout', async () => {
    apiService.get.mockResolvedValue({
      data: {
        ...SETTINGS,
        site_description: 'Tienda ceremonial',
        shipping_fee_default: 150,
        free_shipping_threshold: 1500,
        allow_guest_checkout: true,
      },
    });
    render(wrap());
    await screen.findByDisplayValue('ecommerce-ui');
    expect(screen.getByLabelText(/Descripcion del sitio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Costo de envio por defecto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Umbral de envio gratis/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Permitir checkout como invitado/i)).toBeInTheDocument();
  });
});
