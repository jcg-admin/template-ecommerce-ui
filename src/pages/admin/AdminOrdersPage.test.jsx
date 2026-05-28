import userEvent from '@testing-library/user-event';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import adminReducer from '@redux/slices/adminSlice';
import uiReducer   from '@redux/slices/uiSlice';
import ordersReducer from '@redux/slices/ordersSlice';

import apiService from '@services/apiService';
import AdminOrdersPage from './AdminOrdersPage';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: {
    get:    jest.fn(),
    post:   jest.fn(),
    patch:  jest.fn(),
    delete: jest.fn(),
  },
}));

const makeStore = (state = {}) => configureStore({
  reducer: { admin: adminReducer, ui: uiReducer, orders: ordersReducer },
  preloadedState: state,
});

const makeClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderPage(storeState = {}) {
  return render(
    <Provider store={makeStore(storeState)}>
      <QueryClientProvider client={makeClient()}>
        <MemoryRouter initialEntries={['/admin/orders']}>
          <AdminOrdersPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  );
}

afterEach(() => jest.clearAllMocks());

const ORDERS = [
  {
    order_number: 'PY-2026-000101',
    status: 'PENDING_PAYMENT',
    status_display: 'Pendiente de pago',
    total: '1200.00',
    created_at: '2026-05-01T10:00:00Z',
    customer_email: 'cliente@example.com',
  },
  {
    order_number: 'PY-2026-000102',
    status: 'SHIPPED',
    status_display: 'En camino',
    total: '850.00',
    created_at: '2026-05-02T12:00:00Z',
    customer_email: 'invitado@example.com',
  },
];

const wrap = (ui, storeState = {}) => (
  <Provider store={makeStore(storeState)}>
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  </Provider>
);

afterEach(() => jest.clearAllMocks());

describe('AdminOrdersPage (UC-ORD-09)', () => {
  it('muestra el titulo de la pagina', async () => {
    apiService.get.mockResolvedValue({ data: { results: ORDERS, count: 2 } });
    render(wrap(<AdminOrdersPage />));
    expect(
      await screen.findByRole('heading', { name: /Pedidos/i })
    ).toBeInTheDocument();
  });

  it('renderiza la tabla con las ordenes', async () => {
    apiService.get.mockResolvedValue({ data: { results: ORDERS, count: 2 } });
    render(wrap(<AdminOrdersPage />));
    expect(await screen.findByText('PY-2026-000101')).toBeInTheDocument();
    expect(screen.getByText('PY-2026-000102')).toBeInTheDocument();
    expect(screen.getByText('cliente@example.com')).toBeInTheDocument();
    expect(screen.getByText('invitado@example.com')).toBeInTheDocument();
  });

  it('aplica filtros acumulativos al endpoint admin', async () => {
    // BUG-TEST-ADM02: Los filtros son botones pill sin aria-label de formulario.
    // El componente despacha fetchAdminOrders en mount con {filter:'all'}.
    // Al click en un pill cambia el filtro y vuelve a despachar.
    apiService.get.mockResolvedValue({ data: { results: ORDERS, count: 2 } });
    render(wrap(<AdminOrdersPage />));
    await screen.findByText('PY-2026-000101');
    // Verifica la llamada inicial
    expect(apiService.get).toHaveBeenCalledWith(
      '/api/v1/admin/orders/',
      expect.objectContaining({ params: expect.objectContaining({ filter: 'all' }) }),
    );
    // Clic en el pill 'Cancelado' → dispatch con nuevo filtro
    fireEvent.click(screen.getByRole('button', { name: /Cancelado/i }));
    await waitFor(() => {
      expect(apiService.get).toHaveBeenCalledTimes(2);
    });
  });

  it('enlaza al detalle admin de cada orden', async () => {
    // BUG-TEST-ADM02: los links del pedido usan href con order_number
    apiService.get.mockResolvedValue({ data: { results: ORDERS, count: 2 } });
    render(wrap(<AdminOrdersPage />));
    await screen.findByText('PY-2026-000101');
    const link = document.querySelector('a[href="/admin/orders/PY-2026-000101"]');
    expect(link).not.toBeNull();
  });
});
