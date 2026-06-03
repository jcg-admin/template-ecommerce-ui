/**
 * AdminVoucherDetailPage — render básico (UC-PRO-02)
 *
 * El backend NO expone un endpoint de uso por-voucher
 * (.../vouchers/:id/usage/): las acciones del VoucherViewSet son
 * activate / deactivate / report (este último agregado, detail=False).
 * La página de detalle ya no llama a ningún endpoint /usage/; el uso
 * agregado vive en AdminVoucherReportPage (GET .../vouchers/report/).
 */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import vouchersReducer from '@redux/slices/vouchersSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

import apiService from '@services/apiService';
import AdminVoucherDetailPage from './AdminVoucherDetailPage';

// Reducer admin mínimo: solo el sub-slice que consume la página
// (currentVoucher + voucherChangelog), reaccionando a fetchAdminVoucher.
// Desacopla este test del reducer admin completo.
const adminReducer = (
  state = { currentVoucher: null, voucherChangelog: [] },
  action = {},
) => (action.type === 'admin/fetchAdminVoucher/fulfilled'
  ? { ...state, currentVoucher: action.payload }
  : state);
const uiReducer = (state = {}) => state;

const VOUCHER = {
  id: 7,
  code: 'DEMO7',
  voucher_type: 'PERCENTAGE',
  discount_pct: 10,
  max_uses: 100,
  current_uses: 12,
  valid_from: '2026-01-01',
  valid_until: '2026-12-31',
  is_active: true,
};

const makeStore = () => configureStore({
  reducer: { admin: adminReducer, ui: uiReducer, vouchers: vouchersReducer },
});

const wrap = () => (
  <Provider store={makeStore()}>
    <MemoryRouter initialEntries={['/admin/vouchers/7']}>
      <Routes>
        <Route path="/admin/vouchers/:id" element={<AdminVoucherDetailPage />} />
      </Routes>
    </MemoryRouter>
  </Provider>
);

beforeEach(() => {
  apiService.get.mockResolvedValue({ data: VOUCHER });
});
afterEach(() => jest.clearAllMocks());

describe('AdminVoucherDetailPage (UC-PRO-02)', () => {
  it('renderiza el formulario del voucher', async () => {
    render(wrap());
    expect(await screen.findByDisplayValue('DEMO7')).toBeInTheDocument();
  });

  it('no llama a ningún endpoint /usage/ inexistente en el backend', async () => {
    render(wrap());
    await waitFor(() => expect(apiService.get).toHaveBeenCalled());
    const usageCalls = apiService.get.mock.calls.filter(([url]) =>
      String(url).includes('/usage/'),
    );
    expect(usageCalls).toHaveLength(0);
  });
});
