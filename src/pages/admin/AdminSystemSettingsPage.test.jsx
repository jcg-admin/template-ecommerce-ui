/**
 * Tests — AdminSystemSettingsPage (UC-ADM-04)
 *
 *   GET   /api/v1/admin/settings/
 *   PATCH /api/v1/admin/settings/
 * (campos alineados al AdminSiteSettingsSerializer real)
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
  iva_rate: 16,
  currency: 'MXN',
  free_shipping_threshold: 1500,
  min_stock_threshold: 5,
  payment_timeout_minutes: 30,
  order_timeout_minutes: 60,
  max_return_days: 30,
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

  it('envia PATCH /api/v1/admin/settings/ con los cambios', async () => {
    apiService.get.mockResolvedValue({ data: SETTINGS });
    apiService.patch.mockResolvedValue({ data: SETTINGS });

    render(wrap());
    const input = await screen.findByDisplayValue('ecommerce-ui');
    fireEvent.change(input, { target: { value: 'ecommerce-ui MX' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => {
      expect(apiService.patch).toHaveBeenCalledWith(
        '/api/v1/admin/settings/',
        expect.objectContaining({ site_name: 'ecommerce-ui MX' }),
      );
    });
  });

  // Campos reales del AdminSiteSettingsSerializer (alineados al backend).
  it('expone los campos reales del serializer (iva, timeouts, stock, devolucion)', async () => {
    apiService.get.mockResolvedValue({ data: SETTINGS });
    render(wrap());
    await screen.findByDisplayValue('ecommerce-ui');
    expect(screen.getByLabelText(/Tasa de IVA/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Umbral de envio gratis/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Umbral de stock minimo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Timeout de pago/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dias maximos de devolucion/i)).toBeInTheDocument();
  });
});
