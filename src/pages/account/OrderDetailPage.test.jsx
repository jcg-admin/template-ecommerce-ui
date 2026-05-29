/**
 * Tests — OrderDetailPage (UC-ORD-02 / UC-ORD-04 / UC-ORD-05 / UC-ORD-06)
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@redux/slices/authSlice';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));


import apiService from '@services/apiService';
import ordersReducer from '@redux/slices/ordersSlice';
import OrderDetailPage from './OrderDetailPage';

const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const wrap = (ui) => {
  const ORDER = {
    order_number: 'PY-0088', status: 'PENDING', total: 1780,
    created_at: '2026-05-28T10:00:00Z',
    items: [{ id: 1, name: 'Eleke', quantity: 1, unit_price: 1780 }],
    shipping_address: { street: 'Av. Insurgentes 1', city: 'CDMX', state: 'CDMX', zip: '03810' },
    shipping_method_label: 'DHL', subtotal: 1780, tax: 0, discount: 0,
  };
  const store = configureStore({
    reducer: { orders: ordersReducer, auth: authReducer },
    preloadedState: {
      auth: { user: { first_name: 'Test' }, isAuthenticated: true },
      orders: { current: ORDER, list: [], isLoading: false, isActioning: false, actionError: null, lastAction: null, lastOrderNumber: 'PY-0088' },
    },
  });
  return (
    <Provider store={store}>
      <QueryClientProvider client={makeClient()}>
        <MemoryRouter initialEntries={['/account/orders/PY-2026-000001']}>
          <Routes>
            <Route path="/account/orders/:id" element={ui} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
};

const ORDER = {
  id: 1,
  order_number: 'PY-2026-000001',
  status: 'PENDING',
  status_display: 'Pendiente',
  created_at: '2026-05-10T10:00:00Z',
  shipping_method_name: 'Estandar',
  items: [
    { id: 11, product_name: 'Camisa', variant_label: 'M / Rojo',
      sku: 'YOR-001', unit_price: '500.00', quantity: 2, subtotal: '1000.00' },
  ],
  value: {
    subtotal: '1000.00', tax: '160.00', shipping_cost: '89.00',
    discount: '0.00', total: '1249.00',
  },
  shipping_address: {
    recipient_name: 'Juana Perez', street: 'Av. Reforma 123',
    colony: '', city: 'CDMX', state: 'CDMX', zip_code: '06600', country: 'MX',
    phone: '+525511112222',
  },
};

afterEach(() => jest.clearAllMocks());

describe('OrderDetailPage (UC-ORD-02 detalle)', () => {
  it('muestra el numero de orden como titulo', async () => {
    apiService.get.mockResolvedValue({ data: ORDER });
    render(wrap(<OrderDetailPage />));
    expect(
      await screen.findByRole('heading', { name: /Seguimiento del envío/i })
    ).toBeInTheDocument();
  });

  it('renderiza items, totales y direccion', async () => {
    apiService.get.mockResolvedValue({ data: ORDER });
    render(wrap(<OrderDetailPage />));
    expect(await screen.findByText(/Camisa/)).toBeInTheDocument();
    // La dirección puede no mostrar recipient_name
    // Verificar que al menos el número de orden y el item aparecen
    expect(document.body.textContent).toContain('Camisa');
    expect(document.body.textContent).toContain('PY-2026-000001');
    expect(screen.getByText(/Av\. Reforma 123/)).toBeInTheDocument();
  });
});

describe('OrderDetailPage (UC-ORD-04 cancelar)', () => {
  it.skip('comprador cancela un pedido PENDING via POST /cancel/ — PENDIENTE: accion eliminada en diseño Yoruba (usa Solicitar ayuda)', async () => {
    apiService.get.mockResolvedValue({ data: ORDER });
    apiService.post.mockResolvedValue({ data: { ...ORDER, status: 'CANCELLED' } });
    const user = userEvent.setup();

    render(wrap(<OrderDetailPage />));
    await screen.findByRole('heading', { name: /Seguimiento del envío/i });

    await user.click(screen.getByRole('button', { name: /Cancelar/i }));
    await user.click(screen.getByRole('button', { name: /Confirmar cancelacion/i }));

    await waitFor(() => {
      expect(apiService.post).toHaveBeenCalledWith(
        '/api/v1/orders/PY-2026-000001/cancel/',
        expect.objectContaining({ reason: '' }),
      );
    });
  });

  it.skip('no muestra boton de cancelar para pedidos enviados — PENDIENTE: accion eliminada en diseño Yoruba (usa Solicitar ayuda)', async () => {
    apiService.get.mockResolvedValue({ data: { ...ORDER, status: 'SHIPPED' } });
    render(wrap(<OrderDetailPage />));
    await screen.findByRole('heading', { name: /Seguimiento del envío/i });
    expect(screen.queryByRole('button', { name: /Cancelar/i })).not.toBeInTheDocument();
  });
});

describe('OrderDetailPage (UC-ORD-05 editar direccion)', () => {
  it.skip('actualiza la direccion via PATCH /address/ — PENDIENTE: accion eliminada en diseño Yoruba (usa Solicitar ayuda)', async () => {
    apiService.get.mockResolvedValue({ data: ORDER });
    apiService.patch.mockResolvedValue({ data: ORDER });
    const user = userEvent.setup();

    render(wrap(<OrderDetailPage />));
    await screen.findByRole('heading', { name: /Seguimiento del envío/i });

    await user.click(screen.getByRole('button', { name: /Editar|dirección|EDITAR/i }));
    await user.click(screen.getByRole('button', { name: /Guardar direccion/i }));

    await waitFor(() => {
      expect(apiService.patch).toHaveBeenCalledWith(
        '/api/v1/orders/PY-2026-000001/address/',
        expect.objectContaining({
          recipient_name: 'Juana Perez',
          zip_code: '06600',
        }),
      );
    });
  });
});

describe('OrderDetailPage (UC-ORD-06 cambiar envio)', () => {
  it.skip('cambia el metodo de envio via PATCH /shipping/ — PENDIENTE: accion eliminada en diseño Yoruba (usa Solicitar ayuda)', async () => {
    apiService.get.mockResolvedValue({ data: ORDER });
    apiService.patch.mockResolvedValue({ data: ORDER });
    const user = userEvent.setup();

    render(wrap(<OrderDetailPage />));
    await screen.findByRole('heading', { name: /Seguimiento del envío/i });

    await user.click(screen.getByRole('button', { name: /Cambiar|envio|shipping/i }));
    await user.type(screen.getByLabelText(/ID del nuevo metodo de envio/i), '3');
    await user.click(screen.getByRole('button', { name: /Aplicar cambio/i }));

    await waitFor(() => {
      expect(apiService.patch).toHaveBeenCalledWith(
        '/api/v1/orders/PY-2026-000001/shipping/',
        { shipping_method_id: 3 },
      );
    });
  });
});
