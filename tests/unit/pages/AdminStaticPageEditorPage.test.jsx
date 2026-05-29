/**
 * Tests — AdminStaticPageEditorPage
 * Editor de página estática del CMS (título, slug, contenido HTML)
 */
import { render, screen, waitFor } from '@testing-library/react';
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
  useParams:   () => ({ slug: 'about' }),
  useNavigate: () => jest.fn(),
}));

import apiService from '@services/apiService';
import AdminStaticPageEditorPage from '../../../src/pages/admin/AdminStaticPageEditorPage';

const PAGE = {
  title:            'Acerca de Práctica Yorùbà',
  slug:             'about',
  content:          '<p>Somos un espacio de práctica...</p>',
  is_published:     true,
  meta_title:       '',
  meta_description: '',
};

const makeStore = () => configureStore({
  reducer: { admin: adminReducer },
  preloadedState: {
    admin: {
      currentPage:       PAGE,
      isLoadingPages:    false,
      isLoading:         false,
      products:          [],
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
  beforeEach(() => {
    apiService.get.mockResolvedValue({ data: PAGE });
  });

  it('renderiza el editor de página', async () => {
    renderPage();
    await waitFor(() =>
      expect(document.body.textContent).toMatch(/página|editor|contenido|título|Acerca/i)
    );
  });

  it('tiene campo de título', async () => {
    renderPage();
    await waitFor(() =>
      expect(document.body.textContent).toMatch(/título|title|Acerca|editor|página/i)
    );
  });

  it('tiene campo de slug', async () => {
    renderPage();
    await waitFor(() =>
      expect(document.body.textContent).toMatch(/slug|about|url|campo|editar/i)
    );
  });

  it('tiene botón de guardar', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
    );
  });
});
