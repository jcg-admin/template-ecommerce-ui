/**
 * Tests — PaymentFailedPage
 * Pago rechazado: razón, reintento, historial
 */
import { render, screen, act } from '@testing-library/react';
import { Provider }     from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ordersReducer   from '../../../src/redux/slices/ordersSlice';
import checkoutReducer from '../../../src/redux/slices/checkoutSlice';
import paymentsReducer from '../../../src/redux/slices/paymentsSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'PY-0055' }),
}));

import apiService from '@services/apiService';
import PaymentFailedPage from '../../../src/pages/checkout/PaymentFailedPage';

const ORDER = {
  order_number: 'PY-0055', total: 2500, item_count: 1,
  email: 'oshun@practica.mx',
};

const HISTORY = [
  {
    status: 'FAILED', gateway_label: 'MercadoPago',
    gateway_error_code: 'cc_rejected_insufficient_amount',
    status_label: 'Rechazado', card_last4: '4321',
    created_at: '2026-05-28T12:00:00Z',
  },
];

const makeStore = () => configureStore({
  reducer: {
    orders:   ordersReducer,
    checkout: checkoutReducer,
    payments: paymentsReducer,
  },
  preloadedState: {
    orders:   { current: ORDER, isLoading: false },
    checkout: { paymentHistory: HISTORY, expressEligibility: null },
    payments: { isLoading: false },
  },
});

// renderPage es async: envuelve el mount en act y deja que los thunks
// despachados en useEffect (fetchOrderDetail/fetchPaymentHistory) resuelvan
// dentro de act, evitando el warning "not wrapped in act".
const renderPage = async () => {
  let result;
  await act(async () => {
    result = render(
      <Provider store={makeStore()}>
        <MemoryRouter><PaymentFailedPage /></MemoryRouter>
      </Provider>
    );
  });
  return result;
};

describe('PaymentFailedPage', () => {
  beforeEach(() => {
    // fetchOrderDetail/fetchPaymentHistory se despachan al montar. Sin un
    // mock que resuelva con datos coherentes, el thunk rechaza y limpia
    // state.current (orders.rejected → current=null), borrando los datos
    // precargados. Resolver según la URL mantiene el estado consistente.
    apiService.get.mockImplementation((url) => {
      if (url.includes('/payments/')) return Promise.resolve({ data: HISTORY });
      return Promise.resolve({ data: ORDER });
    });
  });
  afterEach(() => jest.clearAllMocks());

  it('muestra el título de pago rechazado', async () => {
    await renderPage();
    expect(screen.getByRole('heading', { name: /rechaz/i })).toBeInTheDocument();
  });

  it('muestra el número de pedido', async () => {
    await renderPage();
    expect(screen.getByText(/PY-0055/)).toBeInTheDocument();
  });

  it('muestra la razón de rechazo legible', async () => {
    await renderPage();
    expect(screen.getByText(/fondos insuficientes/i)).toBeInTheDocument();
  });

  it('muestra el código de error del gateway', async () => {
    await renderPage();
    expect(screen.getByText(/cc_rejected_insufficient_amount/i)).toBeInTheDocument();
  });

  it('muestra botones de reintento', async () => {
    await renderPage();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SPEI/i })).toBeInTheDocument();
  });

  it('muestra el historial de intentos', async () => {
    await renderPage();
    expect(screen.getByText(/MercadoPago/i)).toBeInTheDocument();
    expect(screen.getByText(/4321/)).toBeInTheDocument();
  });

  it('tiene link de soporte', async () => {
    await renderPage();
    expect(screen.getByRole('link', { name: /soporte/i })).toBeInTheDocument();
  });
});
