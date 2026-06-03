/**
 * Tests — vouchersSlice.fetchVoucherReport (UC-PRO-04 reporte agregado)
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer, { fetchVoucherReport } from './vouchersSlice';
import apiService from '@services/apiService';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

const makeStore = () => configureStore({ reducer: { vouchers: reducer } });

afterEach(() => jest.clearAllMocks());

describe('vouchersSlice — fetchVoucherReport (UC-PRO-04)', () => {
  it('llama a GET /api/v1/admin/vouchers/report/ con params', async () => {
    apiService.get.mockResolvedValueOnce({ data: { results: [] } });
    const store = makeStore();
    await store.dispatch(fetchVoucherReport({ status: 'active' }));
    expect(apiService.get).toHaveBeenCalledWith(
      '/api/v1/admin/vouchers/report/',
      { params: { status: 'active' } },
    );
  });

  it('fulfilled guarda las filas del reporte', async () => {
    apiService.get.mockResolvedValueOnce({
      data: { results: [{ code: 'WELCOME', current_uses: 12, roi: 4.2 }] },
    });
    const store = makeStore();
    await store.dispatch(fetchVoucherReport());
    const state = store.getState().vouchers;
    expect(state.report).toHaveLength(1);
    expect(state.report[0].code).toBe('WELCOME');
    expect(state.isLoadingReport).toBe(false);
  });
});
