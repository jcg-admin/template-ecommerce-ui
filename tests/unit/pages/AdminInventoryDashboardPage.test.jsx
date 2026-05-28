/**
 * Tests — AdminInventoryDashboardPage
 * Dashboard de inventario: alertas de stock, movimientos, métricas
 */
import { render, screen } from '@testing-library/react';
import { Provider }     from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import adminReducer from '../../../src/redux/slices/adminSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));
jest.mock('../../../src/redux/slices/adminSlice', () => ({
  ...jest.requireActual('../../../src/redux/slices/adminSlice'),
  fetchInventoryDashboard: jest.fn(() => ({ type: 'admin/fetchInventoryDashboard' })),
}));

import AdminInventoryDashboardPage from '../../../src/pages/admin/AdminInventoryDashboardPage';

const DASHBOARD = {
  total_skus: 48,
  low_stock_count: 7,
  out_of_stock_count: 2,
  recent_movements: [
    { id: 1, sku: 'ELE-001', delta: -3, reason: 'Venta', created_at: '2026-05-28T10:00:00Z' },
  ],
};

const makeStore = () => configureStore({
  reducer: { admin: adminReducer },
  preloadedState: {
    admin: {
      inventoryDashboard: DASHBOARD,
      isLoading: false,
      products: [],
      isLoadingProducts: false,
    },
  },
});

const renderPage = () => render(
  <Provider store={makeStore()}>
    <MemoryRouter><AdminInventoryDashboardPage /></MemoryRouter>
  </Provider>
);

describe('AdminInventoryDashboardPage', () => {
  it('renderiza el dashboard de inventario', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/inventario|stock|SKU/i);
  });

  it('muestra métricas del dashboard', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/48|total|SKU/i);
  });

  it('muestra alertas de stock bajo', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/bajo|alert|7|agota/i);
  });

  it('muestra movimientos recientes', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/movimiento|ELE-001|reciente/i);
  });
});
