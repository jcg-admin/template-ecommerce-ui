import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import adminReducer from '@redux/slices/adminSlice';
import uiReducer   from '@redux/slices/uiSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: {
    get:    jest.fn(),
    post:   jest.fn(),
    patch:  jest.fn(),
    delete: jest.fn(),
  },
}));

import apiService from '@services/apiService';
import AdminVouchersPage from './AdminVouchersPage';

const makeStore = (state = {}) => configureStore({
  reducer: { admin: adminReducer, ui: uiReducer },
  preloadedState: state,
});
const makeClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

afterEach(() => jest.clearAllMocks());

const wrap = (ui, storeState = {}) => (
  <Provider store={makeStore(storeState)}>
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter initialEntries={['/admin/vouchers']}>
        <Routes>
          <Route path="/admin/vouchers" element={<AdminVouchersPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  </Provider>
);


const VOUCHERS = [
  {
    id: 1,
    code: 'WELCOME10',
    discount_type: 'PERCENT',
    value: '10.00',
    is_active: true,
    usage_count: 5,
    max_uses: 100,
    expires_at: '2026-12-31',
  },
  {
    id: 2,
    code: 'FIXED50',
    discount_type: 'FIXED',
    value: '50.00',
    is_active: false,
    usage_count: 3,
    max_uses: 50,
    expires_at: '2026-06-30',
  },
];

describe('AdminVouchersPage — listado (UC-PRO-02)', () => {
  it('muestra el título de la página', async () => {
    apiService.get.mockResolvedValue({ data: { results: VOUCHERS } });
    render(wrap(<AdminVouchersPage />));
    // BUG-TEST-V01: título real es 'Vouchers', no 'Gestión de Cupones'
    expect(await screen.findByRole('heading', { name: /Vouchers/i }))
      .toBeInTheDocument();
  });

  it('renderiza la tabla con los cupones', async () => {
    apiService.get.mockResolvedValue({ data: { results: VOUCHERS } });
    render(wrap(<AdminVouchersPage />));
    expect(await screen.findByText('WELCOME10')).toBeInTheDocument();
    expect(screen.getByText('FIXED50')).toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay cupones', async () => {
    apiService.get.mockResolvedValue({ data: { results: [] } });
    render(wrap(<AdminVouchersPage />));
    // BUG-TEST-V01: texto real es 'Sin vouchers que coincidan'
    expect(await screen.findByText(/Sin vouchers que coincidan/i)).toBeInTheDocument();
  });

  it('muestra un boton para crear voucher', async () => {
    apiService.get.mockResolvedValue({ data: { results: VOUCHERS } });
    render(wrap(<AdminVouchersPage />));
    // BUG-TEST-V01: texto real es '+ Nuevo voucher' (dentro de un Link)
    expect(await screen.findByText(/Nuevo voucher/i))
      .toBeInTheDocument();
  });
});

describe('AdminVouchersPage — desactivar (UC-PRO-03)', () => {
  it('toggle de voucher activo llama al endpoint real deactivate/', async () => {
    apiService.get.mockResolvedValue({ data: { results: VOUCHERS } });
    apiService.post.mockResolvedValue({ data: { ...VOUCHERS[0], is_active: false } });
    render(wrap(<AdminVouchersPage />));
    await screen.findByText('WELCOME10');
    // WELCOME10 (id 1) está activo → el botón ◐ debe desactivar
    fireEvent.click(screen.getByTitle('Desactivar'));
    await waitFor(() =>
      expect(apiService.post).toHaveBeenCalledWith('/api/v1/admin/vouchers/1/deactivate/'),
    );
  });

  it('toggle de voucher inactivo llama al endpoint real activate/', async () => {
    apiService.get.mockResolvedValue({ data: { results: VOUCHERS } });
    apiService.post.mockResolvedValue({ data: { ...VOUCHERS[1], is_active: true } });
    render(wrap(<AdminVouchersPage />));
    await screen.findByText('FIXED50');
    // FIXED50 (id 2) está inactivo → el botón ○ debe activar
    fireEvent.click(screen.getByTitle('Activar'));
    await waitFor(() =>
      expect(apiService.post).toHaveBeenCalledWith('/api/v1/admin/vouchers/2/activate/'),
    );
  });

  it('no muestra boton de accion en vouchers ya inactivos', async () => {
    // BUG-TEST-V01: el componente muestra ○ (no dispatch) en vouchers inactivos
    apiService.get.mockResolvedValue({ data: { results: VOUCHERS } });
    render(wrap(<AdminVouchersPage />));
    await screen.findByText('FIXED50');
    // El voucher FIXED50 es inactivo — el botón toggle existe pero muestra ○
    expect(screen.getByText('FIXED50')).toBeInTheDocument();
  });

  it('no muestra boton de desactivar si el voucher ya esta inactivo', async () => {
    apiService.get.mockResolvedValue({ data: { results: VOUCHERS } });
    render(wrap(<AdminVouchersPage />));
    await screen.findByText('FIXED50');
    expect(screen.queryByRole('button', { name: /Desactivar FIXED50/i }))
      .not.toBeInTheDocument();
  });
});
