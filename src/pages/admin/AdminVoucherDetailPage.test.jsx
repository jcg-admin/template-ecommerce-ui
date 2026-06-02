/**
 * AdminVoucherDetailPage — sección "Uso del voucher" (UC-PRO-04)
 *
 * Verifica que la sección de uso renderice las métricas devueltas por el
 * endpoint GET /api/v1/admin/vouchers/:id/usage/ (usos totales, descuento
 * total otorgado y últimos canjes).
 */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import adminReducer    from '@redux/slices/adminSlice';
import uiReducer       from '@redux/slices/uiSlice';
import vouchersReducer from '@redux/slices/vouchersSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

import apiService from '@services/apiService';
import AdminVoucherDetailPage from './AdminVoucherDetailPage';

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

const USAGE = {
  total_uses: 12,
  total_discount: 3450.5,
  redemptions: [
    { id: 1, order_number: 'OXY-1001', user_email: 'ana@example.com', discount_amount: 250, redeemed_at: '2026-05-01T10:00:00Z' },
    { id: 2, order_number: 'OXY-1002', user_email: 'beto@example.com', discount_amount: 400, redeemed_at: '2026-05-02T11:00:00Z' },
  ],
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
  apiService.get.mockImplementation((url) => {
    if (String(url).endsWith('/usage/')) return Promise.resolve({ data: USAGE });
    return Promise.resolve({ data: VOUCHER });
  });
});
afterEach(() => jest.clearAllMocks());

describe('AdminVoucherDetailPage — Uso del voucher (UC-PRO-04)', () => {
  it('llama al endpoint de uso del voucher', async () => {
    render(wrap());
    await waitFor(() =>
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/admin\/vouchers\/7\/usage\/$/),
      ),
    );
  });

  it('renderiza la sección "Uso del voucher"', async () => {
    render(wrap());
    expect(await screen.findByRole('heading', { name: /Uso del voucher/i }))
      .toBeInTheDocument();
  });

  it('muestra usos totales y descuento total otorgado', async () => {
    render(wrap());
    expect(await screen.findByText('12')).toBeInTheDocument();
    // Descuento total formateado en MXN
    expect(await screen.findByText(/3,450/)).toBeInTheDocument();
  });

  it('lista los últimos canjes del endpoint', async () => {
    render(wrap());
    expect(await screen.findByText('OXY-1001')).toBeInTheDocument();
    expect(await screen.findByText('ana@example.com')).toBeInTheDocument();
    expect(await screen.findByText('OXY-1002')).toBeInTheDocument();
  });
});
