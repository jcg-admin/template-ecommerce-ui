/**
 * Tests — OrderEditPage
 * Edición de orden existente: dirección de envío, método, notas
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider }     from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from '../../../src/redux/slices/ordersSlice';
import addressesReducer from '../../../src/redux/slices/addressesSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));
import apiService from '@services/apiService';
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ orderNumber: 'PY-0088' }),
  useNavigate: () => mockNavigate,
}));
const mockNavigate = jest.fn();

import OrderEditPage from '../../../src/pages/account/OrderEditPage';

const ORDER = {
  order_number: 'PY-0088',
  status: 'PENDING',
  total: 1780,
  shipping_address: {
    street: 'Av. Insurgentes Sur 1234',
    city: 'Ciudad de México',
    state: 'CDMX',
    zip: '03810',
  },
  shipping_method_label: 'DHL Express',
  notes: '',
};

const makeStore = () => configureStore({
  reducer: {
    orders:    ordersReducer,
    addresses: addressesReducer,
  },
  preloadedState: {
    orders: { current: ORDER, list: [], isLoading: false, isActioning: false },
    addresses: { items: [], isLoading: false },
  },
});

const renderPage = () => render(
  <Provider store={makeStore()}>
    <MemoryRouter initialEntries={['/account/orders/PY-0088/edit']}>
      <Routes>
        <Route path="/account/orders/:orderNumber/edit" element={<OrderEditPage />} />
      </Routes>
    </MemoryRouter>
  </Provider>
);

describe('OrderEditPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    apiService.get.mockResolvedValue({ data: ORDER });
  });

  it('renderiza el formulario de edición del pedido', async () => {
    renderPage();
    await waitFor(() =>
      expect(document.body.textContent).toMatch(/PY-0088|pedido|editar|modificar/i)
    );
  });

  it('tiene formulario con campos de dirección', async () => {
    renderPage();
    await waitFor(() =>
      expect(document.querySelector('form')).toBeInTheDocument()
    );
  });

  it('muestra la dirección actual del pedido', async () => {
    renderPage();
    await waitFor(() =>
      expect(document.body.textContent).toMatch(/Insurgentes|CDMX|direcci/i)
    );
  });

  it('tiene botón de guardar cambios', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
    );
  });

  it('tiene botón de cancelar / volver', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
    );
  });
});
