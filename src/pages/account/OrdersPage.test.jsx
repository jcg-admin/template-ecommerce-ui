/**
 * Tests — OrdersPage (UC-ORD-03)
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from '@redux/slices/ordersSlice';
import uiReducer from '@redux/slices/uiSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

import apiService from '@services/apiService';
import OrdersPage from './OrdersPage';

const makeClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

// BUG-TEST-OP01: agregar Provider de Redux — OrdersPage usa useDispatch/useSelector
const makeStore = (preloadedState = {}) => configureStore({
  reducer: { orders: ordersReducer, ui: uiReducer },
  preloadedState,
});

const wrap = (ui, storeState = {}) => (
  <Provider store={makeStore(storeState)}>
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  </Provider>
);

const ORDERS = [
  { order_number: 'PY-2026-000001', status: 'PENDING',   status_display: 'Pendiente',
    created_at: '2026-05-10T10:00:00Z', total: '1249.00', items_count: 2 },
  { order_number: 'PY-2026-000002', status: 'SHIPPED',   status_display: 'Enviado',
    created_at: '2026-05-09T10:00:00Z', total: '599.00',  items_count: 1 },
  { order_number: 'PY-2026-000003', status: 'CANCELLED', status_display: 'Cancelado',
    created_at: '2026-05-01T10:00:00Z', total: '320.00',  items_count: 3 },
];

afterEach(() => jest.clearAllMocks());

describe('OrdersPage (UC-ORD-03 listado)', () => {
  it('muestra el titulo de la pagina', async () => {
    apiService.get.mockResolvedValue({ data: { results: ORDERS, count: 3 } });
    render(wrap(<OrdersPage />, { orders: { list: ORDERS, isLoading: false } }));
    expect(
      await screen.findByRole('heading', { name: /Mis pedidos/i })
    ).toBeInTheDocument();
  });

  it('renderiza el numero de orden de cada pedido', async () => {
    apiService.get.mockResolvedValue({ data: { results: ORDERS, count: 3 } });
    render(wrap(<OrdersPage />, { orders: { list: ORDERS, isLoading: false } }));
    expect(await screen.findByText('PY-2026-000001')).toBeInTheDocument();
    expect(screen.getByText('PY-2026-000002')).toBeInTheDocument();
    expect(screen.getByText('PY-2026-000003')).toBeInTheDocument();
  });

  it('muestra el estado de cada pedido en espanol', async () => {
    apiService.get.mockResolvedValue({ data: { results: ORDERS, count: 3 } });
    render(wrap(<OrdersPage />, { orders: { list: ORDERS, isLoading: false } }));
    // BUG-OR-02: STATUS_TONE['SHIPPED'].label='En camino' (no 'Enviado')
    // El test usaba status_display del mock pero la página usa STATUS_TONE hardcodeado
    expect(await screen.findByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('En camino')).toBeInTheDocument();
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
  });

  it('enlaza al detalle de cada orden', async () => {
    // BUG-OR-02: el link dice "Ver detalle", no contiene el order_number en su texto
    // Se verifica buscando el order_number en el DOM y luego el href del link más cercano
    apiService.get.mockResolvedValue({ data: { results: ORDERS, count: 3 } });
    render(wrap(<OrdersPage />, { orders: { list: ORDERS, isLoading: false } }));
    // Esperar a que aparezca el primer número de orden
    await screen.findByText('PY-2026-000001');
    // Verificar que hay un link con el href correcto
    const links = screen.getAllByRole('link', { name: /Ver detalle/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute('href', '/account/orders/PY-2026-000001');
  });

  it('muestra estado vacio cuando no hay pedidos', async () => {
    // Con BUG-OR-01 corregido, fetchOrders.fulfilled sobreescribe list con []
    apiService.get.mockResolvedValue({ data: { results: [], count: 0 } });
    render(wrap(<OrdersPage />, { orders: { list: [], isLoading: false } }));
    expect(
      await screen.findByText(/Aún no tienes pedidos/i)
    ).toBeInTheDocument();
  });

  it('llama al endpoint /api/v1/orders/', async () => {
    apiService.get.mockResolvedValue({ data: { results: ORDERS, count: 3 } });
    render(wrap(<OrdersPage />, { orders: { list: ORDERS, isLoading: false } }));
    await screen.findByText('PY-2026-000001');
    // BUG-OR-03: el filtro inicial es 'all', no {}. El slice recibe {filter:'all'}
    expect(apiService.get).toHaveBeenCalledWith(
      '/api/v1/orders/',
      expect.objectContaining({ params: { filter: 'all' } }),
    );
  });
});
