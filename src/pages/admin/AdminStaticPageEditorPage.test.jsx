/**
 * Tests — AdminStaticPageEditorPage (UC-ADM-RTE / F5-T6)
 *
 * Verifica la integración del RichTextEditor en el cuerpo/contenido de la
 * página estática, reemplazando el textarea plano. Cubre:
 *   - El RichTextEditor está presente (role="textbox" + aria-label).
 *   - Precarga el contenido HTML existente de la página.
 *   - Editar emite HTML que se persiste al guardar el borrador
 *     (PATCH /api/v1/admin/pages/:slug/ con data.content actualizado).
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import adminReducer from '@redux/slices/adminSlice';

jest.mock('@components/shared/ConfirmModal/ConfirmModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

import apiService from '@services/apiService';
import AdminStaticPageEditorPage from './AdminStaticPageEditorPage';

// jsdom no implementa document.execCommand; lo mockeamos porque la toolbar
// del RichTextEditor lo invoca.
beforeEach(() => {
  document.execCommand = jest.fn(() => true);
});
afterEach(() => jest.clearAllMocks());

const PAGE = {
  slug: 'nosotros',
  title: 'Nosotros',
  content: '<p>Contenido <strong>original</strong></p>',
  draft_content: '',
  meta_description: 'meta',
  version: 2,
};

const makeStore = (state = {}) => configureStore({
  reducer: { admin: adminReducer },
  preloadedState: state,
});

const renderPage = (storeState = {}) => {
  const store = makeStore({
    admin: {
      currentPage: PAGE,
      pageVersions: [],
      isLoadingPages: false,
      ...storeState.admin,
    },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/admin/pages/nosotros']}>
        <Routes>
          <Route path="/admin/pages/:slug" element={<AdminStaticPageEditorPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe('AdminStaticPageEditorPage — RichTextEditor (UC-ADM-RTE)', () => {
  beforeEach(() => {
    // fetchAdminPage / fetchPageVersions disparan al montar: el endpoint de
    // versiones debe devolver un array para que la lista de historial mapee.
    apiService.get.mockImplementation((url) =>
      Promise.resolve({ data: url.endsWith('/versions/') ? [] : PAGE }),
    );
  });

  it('renderiza el RichTextEditor para el contenido en lugar del textarea plano', async () => {
    renderPage();
    const editor = await screen.findByRole('textbox', { name: 'Contenido de la página' });
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute('contenteditable', 'true');
    expect(editor).toHaveAttribute('aria-multiline', 'true');
  });

  it('precarga el contenido HTML de la página en el área editable', async () => {
    renderPage();
    const editor = await screen.findByRole('textbox', { name: 'Contenido de la página' });
    await waitFor(() => {
      expect(editor.innerHTML).toBe('<p>Contenido <strong>original</strong></p>');
    });
  });

  it('al guardar borrador, persiste el HTML editado vía PATCH', async () => {
    apiService.patch.mockResolvedValue({ data: { ...PAGE, draft_content: 'x' } });
    renderPage();

    const editor = await screen.findByRole('textbox', { name: 'Contenido de la página' });
    editor.innerHTML = '<p>Contenido <em>editado</em></p>';
    fireEvent.input(editor);

    fireEvent.click(screen.getByRole('button', { name: /Guardar borrador/i }));

    await waitFor(() => {
      expect(apiService.patch).toHaveBeenCalledWith(
        '/api/v1/admin/pages/nosotros/',
        expect.objectContaining({ content: '<p>Contenido <em>editado</em></p>' }),
      );
    });
  });
});
