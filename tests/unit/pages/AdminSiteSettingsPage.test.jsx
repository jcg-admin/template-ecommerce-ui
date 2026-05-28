/**
 * Tests — AdminSiteSettingsPage
 * Configuración global del sitio: nombre, moneda, impuestos, etc.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider }     from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import apiService from '../../../src/services/apiService';
import adminReducer from '../../../src/redux/slices/adminSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

jest.mock('../../../src/redux/slices/adminSlice', () => {
  const actual = jest.requireActual('../../../src/redux/slices/adminSlice');
  return {
    ...actual,
    fetchSiteSettings: jest.fn(() => ({ type: 'admin/fetchSiteSettings' })),
    updateSiteSettings: jest.fn(() => ({ type: 'admin/updateSiteSettings' })),
  };
});

import AdminSiteSettingsPage from '../../../src/pages/admin/AdminSiteSettingsPage';

const SETTINGS = {
  site_name: 'Práctica Yorùbà',
  site_email: 'hola@practica.mx',
  currency: 'MXN',
  tax_rate: 16,
  free_shipping_threshold: 1500,
  contact_phone: '+52 55 1234 5678',
};

const makeStore = () => configureStore({
  reducer: { admin: adminReducer },
  preloadedState: {
    admin: {
      siteSettings: SETTINGS,
      isLoading: false,
      products: [],
      isLoadingProducts: false,
    },
  },
});

const renderPage = () => render(
  <Provider store={makeStore()}>
    <MemoryRouter><AdminSiteSettingsPage /></MemoryRouter>
  </Provider>
);

describe('AdminSiteSettingsPage', () => {
  it('renderiza el título de ajustes del sitio', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /ajustes del sitio/i }))
      .toBeInTheDocument();
  });

  it('muestra el formulario de configuración', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /guardar|save/i }))
      .toBeInTheDocument();
  });

  it('el formulario tiene secciones de configuración', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/nombre|moneda|impuesto|envío/i);
  });

  it('tiene al menos un campo de texto editable', () => {
    renderPage();
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });
});
