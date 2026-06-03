import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import adminReducer from '@redux/slices/adminSlice';
import uiReducer   from '@redux/slices/uiSlice';


jest.mock('@components/shared/ConfirmModal/ConfirmModal', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: function ConfirmModal({ open, onConfirm, onClose, message }) {
      if (!open) return null;
      return React.createElement('div', { 'data-testid': 'confirm-modal' },
        React.createElement('p', null, message),
        React.createElement('button', { type: 'button', onClick: onConfirm }, 'Confirmar'),
        React.createElement('button', { type: 'button', onClick: onClose }, 'Cancelar'),
      );
    },
  };
});
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
import AdminCategoriesPage from './AdminCategoriesPage';

const makeStore = (state = {}) => configureStore({
  reducer: { admin: adminReducer, ui: uiReducer },
  preloadedState: state,
});
const makeClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

afterEach(() => jest.clearAllMocks());

// wrap se define después de los datos de test


const CATEGORIES = [
  {
    id: 1, name: 'Collares', slug: 'collares', product_count: 12, is_active: true,
    children: [
      { id: 11, name: 'Collares de mazo', slug: 'collares-mazo', product_count: 4, is_active: true, children: [] },
    ],
  },
  { id: 2, name: 'Elekes', slug: 'elekes', product_count: 8, is_active: true, children: [] },
];

const renderPage = (storeState = {}) => {
  const store = makeStore({
    admin: { categoryTree: CATEGORIES, isLoadingCategories: false, ...storeState.admin },
    ui:    { sidebar: false, darkMode: false },
  });
  const client = makeClient();
  return render(
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/admin/categories']}>
          <Routes>
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
};
// Alias para compatibilidad con los tests que llaman wrap()
const wrap = renderPage;

describe('AdminCategoriesPage (UC-CAT-06)', () => {
  it('muestra el listado de categorias', async () => {
    // BUG-TEST-CAT01: el componente usa un tree div, no una tabla.
    // Los nodos se renderizan como spans con el nombre.
    // La data viene del preloadedState (categoryTree) + fetchAdminCategories dispatch.
    apiService.get.mockResolvedValue({ data: { results: CATEGORIES, count: 2 } });
    wrap();
    expect(
      await screen.findByRole('heading', { name: /Categor/i, level: 1 }),
    ).toBeInTheDocument();
    // Los nombres se muestran como texto en el árbol
    expect(await screen.findByText('Collares')).toBeInTheDocument();
    expect(screen.getByText('Elekes')).toBeInTheDocument();
  });

  it('crea una categoria via POST /api/v1/admin/categories/', async () => {
    apiService.get.mockResolvedValue({ data: { results: CATEGORIES, count: 2 } });
    apiService.post.mockResolvedValue({ data: { id: 99, name: 'Nueva', slug: 'nueva', children: [] } });
    wrap();
    await screen.findByText('Collares');

    // Abrir el form de nueva categoría — botón raíz
    // BUG-TEST-CAT01: botón real dice '+ Categoría raíz'
    const addRootBtn = await screen.findByRole('button', { name: /Categoría raíz/i });
    fireEvent.click(addRootBtn);

    // Rellenar el form
    const input = await screen.findByLabelText(/Nombre/i);
    fireEvent.change(input, { target: { value: 'Nueva categoria' } });
    fireEvent.click(screen.getByRole('button', { name: /^Crear$/i }));

    await waitFor(() => {
      expect(apiService.post).toHaveBeenCalledWith(
        '/api/v1/admin/categories/',
        expect.objectContaining({ name: 'Nueva categoria' }),
      );
    });
  });

  it('el form de crear requiere nombre (atributo required)', async () => {
    // BUG-TEST-CAT01: required nativo, sin mensaje personalizado en el componente
    apiService.get.mockResolvedValue({ data: { results: CATEGORIES, count: 2 } });
    wrap();
    await screen.findByText('Collares');
    const addRootBtn = await screen.findByRole('button', { name: /Categoría raíz/i });
    fireEvent.click(addRootBtn);
    const input = await screen.findByLabelText(/Nombre/i);
    expect(input).toBeRequired();
  });

  it('muestra las categorias cargadas desde el store', async () => {
    apiService.get.mockResolvedValue({ data: { results: CATEGORIES, count: 2 } });
    wrap();
    expect(await screen.findByText('Collares')).toBeInTheDocument();
    expect(screen.getByText('Elekes')).toBeInTheDocument();
  });

  // UC-ADM-TREELIST (F6): integracion del TreeList tabular
  it('renderiza las categorias en un TreeList (treegrid) con columnas', async () => {
    apiService.get.mockResolvedValue({ data: { results: CATEGORIES, count: 2 } });
    wrap();
    await screen.findByText('Collares');

    // El contenedor del arbol expone role=treegrid con su aria-label
    const grid = screen.getByRole('treegrid', { name: 'Categorías' });
    expect(grid).toBeInTheDocument();

    // Cabeceras de columna (slug, productos)
    expect(screen.getByRole('columnheader', { name: /Slug/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Productos/i })).toBeInTheDocument();

    // Datos derivados por categoria (slug y product_count formateado)
    expect(screen.getByText('collares')).toBeInTheDocument();
    expect(screen.getByText('12 productos')).toBeInTheDocument();
  });

  it('muestra la jerarquia: la subcategoria hija aparece expandida por defecto', async () => {
    apiService.get.mockResolvedValue({ data: { results: CATEGORIES, count: 2 } });
    wrap();
    // defaultExpandedIds incluye todos los nodos -> la hija es visible
    expect(await screen.findByText('Collares de mazo')).toBeInTheDocument();
  });

  it('una accion del TreeList dispara su handler (eliminar -> ConfirmModal -> DELETE)', async () => {
    apiService.get.mockResolvedValue({ data: { results: CATEGORIES, count: 2 } });
    apiService.delete.mockResolvedValue({ data: { id: 1 } });
    wrap();
    await screen.findByText('Collares');

    // Cada fila del treegrid expone sus acciones; tomamos el primer "Eliminar"
    const deleteBtns = screen.getAllByRole('button', { name: /Eliminar/i });
    fireEvent.click(deleteBtns[0]);

    // El handler abre el ConfirmModal (mock) con el mensaje de la categoria
    expect(await screen.findByTestId('confirm-modal')).toBeInTheDocument();
    expect(screen.getByText(/¿Eliminar "Collares"\?/)).toBeInTheDocument();

    // Confirmar dispara el thunk deleteCategory -> DELETE al endpoint
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));
    await waitFor(() => {
      expect(apiService.delete).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/admin/categories/1/'),
      );
    });
  });
});
