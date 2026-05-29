/**
 * Tests — OrderSuccessPage
 * Confirmación post-pago
 */
import { render, screen, waitFor } from '@testing-library/react';
import { Provider }       from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from '../../../src/redux/slices/ordersSlice';

const ORDER_MOCK = {
  order_number: 'PY-0099',
  total: 1980,
  item_count: 2,
  email: 'oshun@practica.mx',
  eta: '2-4 días',
  shipping_method_label: 'DHL Express',
  items: [{ id: 1, name: 'Eleke de Oshún', orisha_name: 'Oshún', image_url: null }],
  payment: { status_label: 'Aprobado', gateway_label: 'MercadoPago', gateway_payment_id: 'MP-123' },
  user: { first_name: 'Yetunde' },
};

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams:   () => ({ id: 'PY-0099' }),
  useNavigate: () => jest.fn(),
}));

import apiService from '@services/apiService';
import OrderSuccessPage from '../../../src/pages/checkout/OrderSuccessPage';

const makeStore = () => configureStore({
  reducer: { orders: ordersReducer },
  preloadedState: {
    orders: {
      current: ORDER_MOCK, list: [], isLoading: false,
      isActioning: false, actionError: null, lastAction: null, lastOrderNumber: 'PY-0099',
    },
  },
});

const renderPage = () => render(
  <Provider store={makeStore()}>
    <MemoryRouter initialEntries={['/order/PY-0099/confirmacion']}>
      <Routes>
        <Route path="/order/:id/confirmacion" element={<OrderSuccessPage />} />
        <Route path="*" element={<div data-testid="fallback" />} />
      </Routes>
    </MemoryRouter>
  </Provider>
);

describe('OrderSuccessPage', () => {
  beforeEach(() => {
    apiService.get.mockResolvedValue({ data: ORDER_MOCK });
  });

  it('muestra el número de pedido', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/PY-0099/)).toBeInTheDocument()
    );
  });

  it('personaliza el saludo con el nombre del usuario', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Yetunde/i)).toBeInTheDocument()
    );
  });

  it('muestra contenido de confirmación', async () => {
    renderPage();
    await waitFor(() =>
      expect(document.body.textContent).toMatch(/confir|pedido|pago|DHL|Eleke/i)
    );
  });

  it('muestra el total del pedido', async () => {
    renderPage();
    await waitFor(() =>
      expect(document.body.textContent).toMatch(/1.980|1,980|1980/)
    );
  });

  it('tiene botones de continuidad', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByRole('link').length).toBeGreaterThan(0)
    );
  });
});
