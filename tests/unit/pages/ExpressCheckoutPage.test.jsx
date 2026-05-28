/**
 * Tests — ExpressCheckoutPage
 * One-click checkout para clientes recurrentes
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider }     from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer     from '../../../src/redux/slices/cartSlice';
import checkoutReducer from '../../../src/redux/slices/checkoutSlice';
import paymentsReducer from '../../../src/redux/slices/paymentsSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
const mockNavigate = jest.fn();

import ExpressCheckoutPage from '../../../src/pages/checkout/ExpressCheckoutPage';

const CART = {
  items: [{ id: 1, name: 'Eleke Oshún', quantity: 1, price: 890 }],
  totals: { subtotal: 890, shipping: 0, total: 890 },
};

const makeStore = (eligible = true) => configureStore({
  reducer: {
    cart:     cartReducer,
    checkout: checkoutReducer,
    payments: paymentsReducer,
  },
  preloadedState: {
    cart:     { ...CART, isLoading: false },
    checkout: {
      expressEligibility: { eligible },
      savedAddress:   { street: 'Av. Reforma 123', city: 'CDMX' },
      savedPayment:   { type: 'card', last4: '9876' },
      paymentHistory: [],
    },
    payments: { isLoading: false },
  },
});

const renderPage = (eligible = true) => render(
  <Provider store={makeStore(eligible)}>
    <MemoryRouter><ExpressCheckoutPage /></MemoryRouter>
  </Provider>
);

describe('ExpressCheckoutPage', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('muestra pantalla de no elegible si eligible=false', () => {
    renderPage(false);
    expect(screen.getByRole('heading', { name: /necesitas un pedido más/i }))
      .toBeInTheDocument();
  });

  it('muestra botón de checkout express cuando es elegible', () => {
    renderPage(true);
    // El botón de confirmar pago express
    const btn = screen.getByRole('button', { name: /pagar|confirmar|express/i });
    expect(btn).toBeInTheDocument();
  });

  it('botón de no elegible navega a /checkout', () => {
    renderPage(false);
    fireEvent.click(screen.getByRole('button', { name: /checkout normal/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });

  it('muestra los items del carrito cuando es elegible', () => {
    renderPage(true);
    // Al menos algún texto del carrito debería ser visible
    const text = document.body.textContent;
    expect(text).toMatch(/eleke|oshún|890|carrito/i);
  });
});
