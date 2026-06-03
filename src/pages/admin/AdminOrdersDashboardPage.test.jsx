/**
 * Tests — AdminOrdersDashboardPage (UC-ORD-10 + UC-ADM-KANBAN F5-T14)
 */
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import adminReducer from '@redux/slices/adminSlice';
import uiReducer from '@redux/slices/uiSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

import apiService from '@services/apiService';
import AdminOrdersDashboardPage from './AdminOrdersDashboardPage';

const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const makeStore = () =>
  configureStore({ reducer: { admin: adminReducer, ui: uiReducer } });

const wrap = (ui, store = makeStore()) => (
  <Provider store={store}>
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  </Provider>
);

const DATA = {
  order_counts: {
    pending: 5, processing: 3, in_preparation: 2, shipped: 1, total_active: 11,
  },
  expiring_orders: [
    { order_number: 'PY-2026-000900', user__email: 'lento@example.com',
      created_at: '2026-05-19T08:00:00Z' },
  ],
  day_summary: { orders_count: 7, total_revenue: '12500.00' },
  latest_orders: [
    { order_number: 'PY-2026-000999', status: 'PENDING',
      created_at: '2026-05-19T09:00:00Z',
      user__email: 'reciente@example.com', value__total: '999.00' },
    { order_number: 'PY-2026-000888', status: 'SHIPPED',
      created_at: '2026-05-18T09:00:00Z',
      user__email: 'enviado@example.com', value__total: '450.00' },
  ],
  payment_timeout_minutes: 30,
};

afterEach(() => jest.clearAllMocks());

describe('AdminOrdersDashboardPage (UC-ORD-10)', () => {
  it('muestra el titulo del dashboard', async () => {
    apiService.get.mockResolvedValue({ data: DATA });
    render(wrap(<AdminOrdersDashboardPage />));
    expect(
      await screen.findByRole('heading', { name: /Dashboard transaccional/i })
    ).toBeInTheDocument();
  });

  it('renderiza contadores por estado', async () => {
    apiService.get.mockResolvedValue({ data: DATA });
    render(wrap(<AdminOrdersDashboardPage />));
    const countsHeading = await screen.findByRole('heading', { name: /Pedidos por estado/i });
    const countsSection = countsHeading.closest('section');
    expect(within(countsSection).getByText(/Pendientes/i).parentElement).toHaveTextContent('5');
    expect(within(countsSection).getByText(/En proceso/i).parentElement).toHaveTextContent('3');
    expect(within(countsSection).getByText(/Activos/i).parentElement).toHaveTextContent('11');
  });

  it('renderiza ordenes proximas a expirar', async () => {
    apiService.get.mockResolvedValue({ data: DATA });
    render(wrap(<AdminOrdersDashboardPage />));
    expect(await screen.findByText('PY-2026-000900')).toBeInTheDocument();
    expect(screen.getByText('lento@example.com')).toBeInTheDocument();
  });

  it('renderiza ultimos pedidos con enlace al detalle', async () => {
    apiService.get.mockResolvedValue({ data: DATA });
    render(wrap(<AdminOrdersDashboardPage />));
    const links = await screen.findAllByRole('link', { name: /PY-2026-000999/ });
    expect(links[0]).toHaveAttribute('href', '/admin/orders/PY-2026-000999');
  });

  it('llama al endpoint /api/v1/admin/dashboard/', async () => {
    apiService.get.mockResolvedValue({ data: DATA });
    render(wrap(<AdminOrdersDashboardPage />));
    await screen.findByRole('heading', { name: /Dashboard transaccional/i });
    expect(apiService.get).toHaveBeenCalledWith(
      '/api/v1/admin/dashboard/',
      expect.any(Object),
    );
  });
});

describe('AdminOrdersDashboardPage — Tablero Kanban (UC-ADM-KANBAN)', () => {
  it('renderiza el tablero con una columna por estado', async () => {
    apiService.get.mockResolvedValue({ data: DATA });
    render(wrap(<AdminOrdersDashboardPage />));
    const board = await screen.findByRole('group', { name: 'Pedidos por estado' });
    expect(within(board).getByRole('region', { name: 'Pendiente' })).toBeInTheDocument();
    expect(within(board).getByRole('region', { name: 'En proceso' })).toBeInTheDocument();
    expect(within(board).getByRole('region', { name: 'En preparacion' })).toBeInTheDocument();
    expect(within(board).getByRole('region', { name: 'Enviado' })).toBeInTheDocument();
    expect(within(board).getByRole('region', { name: 'Entregado' })).toBeInTheDocument();
  });

  it('coloca cada pedido en la columna de su estado', async () => {
    apiService.get.mockResolvedValue({ data: DATA });
    render(wrap(<AdminOrdersDashboardPage />));
    const pending = await screen.findByRole('region', { name: 'Pendiente' });
    const shipped = screen.getByRole('region', { name: 'Enviado' });
    expect(within(pending).getByText('PY-2026-000999')).toBeInTheDocument();
    expect(within(shipped).getByText('PY-2026-000888')).toBeInTheDocument();
    // El pedido pendiente no aparece en la columna de enviados.
    expect(within(shipped).queryByText('PY-2026-000999')).not.toBeInTheDocument();
  });

  it('mover una tarjeta dispara el cambio de estado (PATCH status)', async () => {
    apiService.get.mockResolvedValue({ data: DATA });
    apiService.patch.mockResolvedValue({ data: { status: 'PROCESSING' } });
    render(wrap(<AdminOrdersDashboardPage />));
    const pending = await screen.findByRole('region', { name: 'Pendiente' });
    // El pedido PENDING avanza a la siguiente columna (PROCESSING).
    const nextBtn = within(pending).getByRole('button', {
      name: /Mover .*PY-2026-000999.* a la columna siguiente/i,
    });
    fireEvent.click(nextBtn);
    expect(apiService.patch).toHaveBeenCalledWith(
      '/api/v1/orders/PY-2026-000999/status/',
      expect.objectContaining({ status: 'PROCESSING' }),
    );
  });
});
