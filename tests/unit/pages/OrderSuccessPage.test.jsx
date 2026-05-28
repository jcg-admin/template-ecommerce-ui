/**
 * Tests — OrderSuccessPage
 * Confirmación post-pago
 */
import { render, screen } from '@testing-library/react';
import { Provider }       from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from '../../../src/redux/slices/ordersSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'PY-0099' }),
}));

import OrderSuccessPage from '../../../src/pages/checkout/OrderSuccessPage';

const ORDER_MOCK = {
  order_number: 'PY-0099',
  total: 1980,
  item_count: 2,
  email: 'oshun@practica.mx',
  eta: '2-4 días',
  shipping_method_label: 'DHL Express',
  items: [
    { id: 1, name: 'Eleke de Oshún', orisha_name: 'Oshún', image_url: null },
  ],
  payment: { status_label: 'Aprobado', gateway_label: 'MercadoPago', gateway_payment_id: 'MP-123' },
  user: { first_name: 'Yetunde' },
};

const makeStore = () => configureStore({
  reducer: { orders: ordersReducer },
  preloadedState: { orders: { current: ORDER_MOCK, isLoading: false } },
});

const renderPage = () => render(
  <Provider store={makeStore()}>
    <MemoryRouter initialEntries={['/order/PY-0099/confirmacion']}>
      <OrderSuccessPage />
    </MemoryRouter>
  </Provider>
);

describe('OrderSuccessPage', () => {
  it('muestra el número de pedido', () => {
    renderPage();
    expect(screen.getByText(/PY-0099/)).toBeInTheDocument();
  });

  it('personaliza el saludo con el nombre del usuario', () => {
    renderPage();
    expect(screen.getByText(/Yetunde/i)).toBeInTheDocument();
  });

  it('muestra los pasos de qué pasa ahora', () => {
    renderPage();
    expect(screen.getByText(/empacamos tu pedido/i)).toBeInTheDocument();
    expect(screen.getByText(/DHL recoge y envía/i)).toBeInTheDocument();
  });

  it('muestra el total del pedido', () => {
    renderPage();
    expect(screen.getByText(/1.980|1980|1,980/)).toBeInTheDocument();
  });

  it('tiene botones de continuidad hacia catálogo y santoral', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /seguir explorando/i })).toHaveAttribute('href', '/catalog');
    expect(screen.getByRole('link', { name: /santoral/i })).toBeInTheDocument();
  });

  it('renderiza loading mientras no hay orden', () => {
    const emptyStore = configureStore({
      reducer: { orders: ordersReducer },
      preloadedState: { orders: { current: null, isLoading: true } },
    });
    render(
      <Provider store={emptyStore}>
        <MemoryRouter><OrderSuccessPage /></MemoryRouter>
      </Provider>
    );
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });
});
