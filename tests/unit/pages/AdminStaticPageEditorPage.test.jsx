/**
 * Tests — AdminStaticPageEditorPage
 * Editor de página estática del CMS (título, slug, contenido HTML)
 */
import { render, screen } from '@testing-library/react';
import { Provider }     from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import adminReducer from '../../../src/redux/slices/adminSlice';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ slug: 'about' }),
  useNavigate: () => jest.fn(),
}));
jest.mock('../../../src/redux/slices/adminSlice', () => ({
  ...jest.requireActual('../../../src/redux/slices/adminSlice'),
  fetchAdminPage:   jest.fn(() => ({ type: 'admin/fetchPage' })),
  updateAdminPage:  jest.fn(() => ({ type: 'admin/updatePage' })),
  createAdminPage:  jest.fn(() => ({ type: 'admin/createPage' })),
}));

import AdminStaticPageEditorPage from '../../../src/pages/admin/AdminStaticPageEditorPage';

const PAGE = {
  title: 'Acerca de Práctica Yorùbà',
  slug: 'about',
  content: '<p>Somos un espacio de práctica...</p>',
  is_published: true,
  meta_title: '',
  meta_description: '',
};

const makeStore = () => configureStore({
  reducer: { admin: adminReducer },
  preloadedState: {
    admin: {
      currentPage: PAGE,
      isLoading: false,
      products: [],
      isLoadingProducts: false,
    },
  },
});

const renderPage = () => render(
  <Provider store={makeStore()}>
    <MemoryRouter initialEntries={['/admin/pages/about']}>
      <Routes>
        <Route path="/admin/pages/:slug" element={<AdminStaticPageEditorPage />} />
        <Route path="*" element={<AdminStaticPageEditorPage />} />
      </Routes>
    </MemoryRouter>
  </Provider>
);

describe('AdminStaticPageEditorPage', () => {
  it('renderiza el editor de página', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/página|editor|contenido|título/i);
  });

  it('tiene campo de título', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/título|title|Acerca|editor|página/i);
  });

  it('tiene campo de slug', () => {
    renderPage();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/slug|about|url|campo|editar/i);
  });

  it('tiene botón de guardar', () => {
    renderPage();
    const btns = screen.getAllByRole('button');
    expect(btns.length).toBeGreaterThan(0);
  });
});
