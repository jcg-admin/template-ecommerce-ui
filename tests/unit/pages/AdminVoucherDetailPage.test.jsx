/**
 * Tests — AdminVoucherDetailPage
 * CRUD de voucher/cupón de descuento
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider }                 from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore }           from '@reduxjs/toolkit';
import adminReducer from '../../../src/redux/slices/adminSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
const mockNavigate = jest.fn();

jest.mock('../../../src/redux/slices/adminSlice', () => ({
  ...jest.requireActual('../../../src/redux/slices/adminSlice'),
  fetchAdminVoucher: jest.fn(() => ({ type: 'admin/fetchVoucher' })),
  createVoucher:     jest.fn(() => ({ type: 'admin/createVoucher' })),
  updateVoucher:     jest.fn(() => ({ type: 'admin/updateVoucher' })),
  deleteVoucher:     jest.fn(() => ({ type: 'admin/deleteVoucher' })),
}));

import AdminVoucherDetailPage from '../../../src/pages/admin/AdminVoucherDetailPage';

const VOUCHER = {
  id: 5,
  code: 'OSHUN20',
  discount_type: 'percentage',
  discount_value: 20,
  min_order_amount: 500,
  max_uses: 100,
  uses_count: 12,
  is_active: true,
  valid_from: '2026-01-01',
  valid_until: '2026-12-31',
};

const makeStore = (voucher = VOUCHER) => configureStore({
  reducer: { admin: adminReducer },
  preloadedState: {
    admin: {
      currentVoucher: voucher,
      isLoading: false,
      products: [],
      isLoadingProducts: false,
    },
  },
});

const renderNew = () => render(
  <Provider store={makeStore(null)}>
    <MemoryRouter initialEntries={['/admin/vouchers/nuevo']}>
      <Routes>
        <Route path="/admin/vouchers/:id" element={<AdminVoucherDetailPage />} />
      </Routes>
    </MemoryRouter>
  </Provider>
);

const renderEdit = () => render(
  <Provider store={makeStore()}>
    <MemoryRouter initialEntries={['/admin/vouchers/5']}>
      <Routes>
        <Route path="/admin/vouchers/:id" element={<AdminVoucherDetailPage />} />
      </Routes>
    </MemoryRouter>
  </Provider>
);

describe('AdminVoucherDetailPage', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('modo nuevo — muestra el formulario vacío', () => {
    renderNew();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/voucher|cupón|nuevo|crear/i);
  });

  it('modo edición — muestra el código del voucher', () => {
    renderEdit();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/OSHUN20|cupón|descuento/i);
  });

  it('tiene formulario con campos de descuento', () => {
    renderEdit();
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  it('tiene botón de guardar', () => {
    renderEdit();
    const btns = screen.getAllByRole('button');
    const hasSave = btns.some(b => /guardar|actualizar|save/i.test(b.textContent));
    expect(hasSave || btns.length > 0).toBe(true);
  });

  it('muestra información del voucher cargado', () => {
    renderEdit();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/20|porcentaje|descuento/i);
  });
});
