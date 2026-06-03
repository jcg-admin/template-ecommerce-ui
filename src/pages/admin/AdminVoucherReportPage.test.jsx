/**
 * Tests — AdminVoucherReportPage (UC-PRO-04 reporte de uso de vouchers)
 * Reporte agregado: ranking por usos, ROI por voucher, filtros y export CSV.
 */
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

import apiService from '@services/apiService';
import vouchersReducer from '@redux/slices/vouchersSlice';
import AdminVoucherReportPage from './AdminVoucherReportPage';

const REPORT = [
  { code: 'WELCOME10', type: 'PERCENT', current_uses: 30, total_discount: 1500, orders_count: 30, revenue: 9000, roi: 6, created_at: '2026-05-01' },
  { code: 'ENVIOGRATIS', type: 'FIXED', current_uses: 8, total_discount: 800, orders_count: 8, revenue: 2400, roi: 3, created_at: '2026-05-10' },
];

const wrap = () => {
  const store = configureStore({ reducer: { vouchers: vouchersReducer } });
  return (
    <Provider store={store}>
      <MemoryRouter><AdminVoucherReportPage /></MemoryRouter>
    </Provider>
  );
};

afterEach(() => jest.clearAllMocks());

describe('AdminVoucherReportPage (UC-PRO-04)', () => {
  it('carga el reporte agregado al montar (GET /admin/vouchers/report/)', async () => {
    apiService.get.mockResolvedValue({ data: { results: REPORT } });
    render(wrap());
    await waitFor(() =>
      expect(apiService.get).toHaveBeenCalledWith(
        '/api/v1/admin/vouchers/report/',
        expect.objectContaining({ params: expect.anything() }),
      ),
    );
  });

  it('renderiza filas con codigo y ROI', async () => {
    apiService.get.mockResolvedValue({ data: { results: REPORT } });
    render(wrap());
    expect(await screen.findByText('WELCOME10')).toBeInTheDocument();
    expect(screen.getByText('ENVIOGRATIS')).toBeInTheDocument();
    // columna ROI presente en cabecera
    expect(screen.getByRole('columnheader', { name: /ROI/i })).toBeInTheDocument();
  });

  it('expone un boton de exportar CSV', async () => {
    apiService.get.mockResolvedValue({ data: { results: REPORT } });
    render(wrap());
    await screen.findByText('WELCOME10');
    expect(screen.getByRole('button', { name: /Exportar CSV/i })).toBeInTheDocument();
  });

  it('expone un boton de exportar Excel', async () => {
    apiService.get.mockResolvedValue({ data: { results: REPORT } });
    render(wrap());
    await screen.findByText('WELCOME10');
    expect(screen.getByRole('button', { name: /Exportar Excel/i })).toBeInTheDocument();
  });

  it('al filtrar por estado re-consulta el reporte con el param', async () => {
    apiService.get.mockResolvedValue({ data: { results: REPORT } });
    render(wrap());
    await screen.findByText('WELCOME10');
    fireEvent.change(screen.getByLabelText(/Estado/i), { target: { value: 'active' } });
    await waitFor(() =>
      expect(apiService.get).toHaveBeenLastCalledWith(
        '/api/v1/admin/vouchers/report/',
        expect.objectContaining({ params: expect.objectContaining({ status: 'active' }) }),
      ),
    );
  });
});
