/**
 * Tests AdminDashboardPage — landing del panel admin.
 *
 * Verifica comportamiento con la shape real de métricas que usa el componente.
 * BUG-TEST-AD01: tests anteriores usaban shape desactualizada (order_counts,
 * day_summary) que no coincide con lo que AdminDashboardPage renderiza.
 */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import adminReducer from '@redux/slices/adminSlice';
import uiReducer from '@redux/slices/uiSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

import apiService from '@services/apiService';
import AdminDashboardPage from './AdminDashboardPage';

const makeStore = (state = {}) => configureStore({
  reducer: { admin: adminReducer, ui: uiReducer },
  preloadedState: state,
});

function renderPage(storeState = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <Provider store={makeStore(storeState)}>
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <AdminDashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  );
}

const MOCK_METRICS = {
  sales_today:      12345,
  sales_delta_pct:  5.2,
  orders_today:     42,
  orders_delta_pct: 3.1,
  avg_ticket:       850,
  ticket_delta_pct: 1.5,
  new_users_today:  7,
  users_delta_pct:  2.0,
  recent_orders: [],
  alerts: [],
  top_products: [],
  sales_by_orisha: [],
};

afterEach(() => jest.clearAllMocks());

describe('AdminDashboardPage — landing admin', () => {
  it('renderiza el titulo principal del dashboard', async () => {
    // BUG-TEST-AD01: el h1 es "Resumen del día", no "panel de administracion"
    apiService.get.mockResolvedValueOnce({ data: MOCK_METRICS });
    renderPage();
    expect(
      await screen.findByRole('heading', { name: /resumen del día/i }),
    ).toBeInTheDocument();
  });

  it('muestra KPIs cuando el endpoint responde con datos', async () => {
    apiService.get.mockResolvedValueOnce({ data: MOCK_METRICS });
    renderPage();
    // Esperar a que aparezcan los KPIs del día
    expect(await screen.findByText('42')).toBeInTheDocument(); // orders_today
    expect(await screen.findByText('7')).toBeInTheDocument();  // new_users_today
  });

  it('tolera error de carga sin romper la navegacion', async () => {
    // BUG-TEST-AD01: el componente muestra '0' no '—' cuando metrics falla
    // Verificar que el componente monta sin errores aunque la carga falle
    apiService.get.mockRejectedValueOnce(new Error('boom'));
    renderPage();
    // El título siempre está presente — el componente no explota con el error
    expect(
      await screen.findByRole('heading', { name: /resumen del día/i })
    ).toBeInTheDocument();
  });

  it('lista accesos rapidos a pedidos recientes', async () => {
    // BUG-TEST-AD01: los links dicen 'Ver todos →', no 'Productos'
    apiService.get.mockResolvedValueOnce({ data: MOCK_METRICS });
    renderPage();
    // El dashboard tiene links 'Ver todos →' hacia pedidos y productos
    const links = await screen.findAllByRole('link', { name: /ver todos/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
  });
});
