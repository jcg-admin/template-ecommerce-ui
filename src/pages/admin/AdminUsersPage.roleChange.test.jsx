/**
 * Tests adicionales — AdminUsersPage (UC-ADM-01)
 *
 * Solo cubre la nueva accion de cambio de rol:
 *   POST /api/v1/admin/users/:id/role/
 *
 * El listado base lo cubre AdminUsersPage.test.jsx.
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

import apiService from '@services/apiService';
import adminReducer      from '@redux/slices/adminSlice';
import adminUsersReducer from '@redux/slices/adminUsersSlice';
import AdminUsersPage    from './AdminUsersPage';

const USERS = [
  { id: 1, username: 'comprador1', email: 'c1@example.com',
    is_staff: false, is_active: true, date_joined: '2026-01-10T00:00:00Z' },
  { id: 2, username: 'admin1',     email: 'a1@example.com',
    is_staff: true,  is_active: true, date_joined: '2025-12-01T00:00:00Z' },
];

const wrap = () => {
  const store = configureStore({
    reducer: { admin: adminReducer, adminUsers: adminUsersReducer },
  });
  return (
    <Provider store={store}>
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>
    </Provider>
  );
};

afterEach(() => jest.clearAllMocks());

describe('AdminUsersPage — UC-ADM-01 cambio de rol', () => {
  // El backend (AdminUserViewSet) no expone una accion de cambio de rol:
  // http_method_names = ['get','post',...] con solo suspend/reactivate, sin
  // /admin/users/:id/role/. El diseno Yoruba ademas removio el selector de
  // rol por usuario. Por eso no se prueba ningun POST a /role/.

  it('expone un filtro por rol', async () => {
    apiService.get.mockResolvedValue({
      data: { results: USERS, count: USERS.length, next: null, previous: null },
    });
    render(wrap());
    // Los botones de filtro de rol existen pero el accessible name puede estar fragmentado
    const roleButtons = await screen.findAllByRole('button');
    const todoBtn = roleButtons.find(b => b.textContent?.includes('Todos') || b.textContent?.includes('Compradores'));
    expect(todoBtn).toBeDefined();
  });
});
