/**
 * Tests — AdminProductDetailPage (pestaña Imágenes: FileUpload + SortableList)
 *
 * Cubre la integración en el sub-componente ImageGallery:
 *  - El FileUpload de subida múltiple está presente en la pestaña Imágenes.
 *  - El SortableList lista una fila por imagen de admin.currentProduct.images.
 *  - Reordenar (botón "Bajar"/"Subir" del SortableList) dispara
 *    reorderProductImages → PATCH .../images/reorder/ con { order: [...] }.
 *  - Subir un archivo dispara uploadProductImage → POST .../images/.
 */
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

import apiService from '@services/apiService';
import adminReducer from '@redux/slices/adminSlice';
import AdminProductDetailPage from './AdminProductDetailPage';

const PRODUCT = {
  id: 7,
  name: 'Eleke de Shango',
  slug: 'eleke-de-shango',
  sku: 'YOR-007',
  base_price: '500.00',
  stock: 3,
  is_published: true,
  is_featured: false,
  images: [
    { id: 101, url: '/img/a.jpg', is_cover: true },
    { id: 102, url: '/img/b.jpg', is_cover: false },
    { id: 103, url: '/img/c.jpg', is_cover: false },
  ],
};

const makeStore = () =>
  configureStore({
    reducer: { admin: adminReducer },
    preloadedState: {
      admin: { currentProduct: PRODUCT, isLoadingProduct: false },
    },
  });

const renderPage = () => {
  const store = makeStore();
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/admin/products/7']}>
        <Routes>
          <Route path="/admin/products/:id" element={<AdminProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

// Activa la pestaña "Imágenes" (por defecto la página abre en "General").
// fetchAdminProduct se despacha en mount → isLoadingProduct=true (pending);
// esperamos a que el GET resuelva y la pestaña esté presente antes de clicar.
const openImagesTab = async (user) => {
  const tab = await screen.findByRole('button', { name: 'Imágenes' });
  await user.click(tab);
};

// jsdom no implementa URL.createObjectURL/revokeObjectURL; FileUpload los usa
// para generar previews de imagen. Los stubbeamos para los tests de subida.
beforeAll(() => {
  URL.createObjectURL = jest.fn(() => 'blob:mock');
  URL.revokeObjectURL = jest.fn();
});

afterEach(() => jest.clearAllMocks());

describe('AdminProductDetailPage — pestaña Imágenes', () => {
  it('muestra el FileUpload de subida en la pestaña Imágenes', async () => {
    apiService.get.mockResolvedValue({ data: PRODUCT });
    const user = userEvent.setup();
    renderPage();
    await openImagesTab(user);

    expect(
      screen.getByRole('button', { name: /Zona de subida de archivos/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Subir imágenes del producto')).toBeInTheDocument();
    // Input file múltiple (accept image/*) de FileUpload.
    const input = screen.getByLabelText('Seleccionar archivos');
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('multiple');
  });

  it('el SortableList lista una fila por imagen', async () => {
    apiService.get.mockResolvedValue({ data: PRODUCT });
    const user = userEvent.setup();
    renderPage();
    await openImagesTab(user);

    const list = screen.getByRole('list', { name: 'Imágenes del producto' });
    const rows = within(list).getAllByRole('listitem');
    expect(rows).toHaveLength(PRODUCT.images.length);
  });

  it('reordenar (botón Bajar) dispara reorderProductImages → PATCH reorder', async () => {
    apiService.get.mockResolvedValue({ data: PRODUCT });
    apiService.patch.mockResolvedValue({ data: PRODUCT });
    const user = userEvent.setup();
    renderPage();
    await openImagesTab(user);

    const list = screen.getByRole('list', { name: 'Imágenes del producto' });
    const rows = within(list).getAllByRole('listitem');
    // Bajar la primera imagen (id 101) una posición → orden [102, 101, 103].
    await user.click(within(rows[0]).getByRole('button', { name: 'Bajar' }));

    await waitFor(() => {
      expect(apiService.patch).toHaveBeenCalledWith(
        '/api/v1/admin/products/7/images/reorder/',
        { order: [102, 101, 103] },
      );
    });
  });

  it('subir un archivo dispara uploadProductImage → POST images', async () => {
    apiService.get.mockResolvedValue({ data: PRODUCT });
    apiService.post.mockResolvedValue({ data: { id: 999, url: '/img/d.jpg' } });
    const user = userEvent.setup();
    renderPage();
    await openImagesTab(user);

    const input = screen.getByLabelText('Seleccionar archivos');
    const file = new File(['x'], 'd.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(apiService.post).toHaveBeenCalledWith(
        '/api/v1/admin/products/7/images/',
        expect.any(FormData),
      );
    });
    const [, fd] = apiService.post.mock.calls.find(
      (c) => c[0] === '/api/v1/admin/products/7/images/',
    );
    expect(fd.get('image')).toBe(file);
  });
});
