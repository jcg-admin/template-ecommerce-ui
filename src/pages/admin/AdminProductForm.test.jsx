/**
 * Tests — AdminProductForm (UC-ADM-RTE / F5-T5)
 *
 * Verifica la integración del RichTextEditor en el campo de descripción
 * completa del producto, reemplazando el textarea plano. Cubre:
 *   - El RichTextEditor está presente (role="textbox" + aria-label).
 *   - Editar en el editor enriquecido actualiza el estado y llega como
 *     HTML al payload de onSubmit.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// El form carga categorías vía react-query; mockeamos el hook para no
// depender de la red en estos tests centrados en el RichTextEditor.
jest.mock('@hooks/domain/useCategories', () => ({
  __esModule: true,
  useAdminCategories: () => ({
    data: { results: [{ id: 1, name: 'Collares', is_active: true }] },
  }),
}));

import AdminProductForm from './AdminProductForm';

// jsdom no implementa document.execCommand; lo mockeamos porque la toolbar
// del RichTextEditor lo invoca al aplicar formatos.
beforeEach(() => {
  document.execCommand = jest.fn(() => true);
});

const wrap = (ui) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
};

describe('AdminProductForm — RichTextEditor (UC-ADM-RTE)', () => {
  it('renderiza el RichTextEditor para la descripción en lugar del textarea plano', () => {
    render(wrap(<AdminProductForm onSubmit={jest.fn()} />));

    const editor = screen.getByRole('textbox', { name: 'Descripción del producto' });
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute('contenteditable', 'true');
    expect(editor).toHaveAttribute('aria-multiline', 'true');
  });

  it('precarga el HTML inicial de la descripción en el área editable', () => {
    render(wrap(
      <AdminProductForm
        mode="edit"
        onSubmit={jest.fn()}
        initialValues={{
          name: 'Collar Oshun',
          short_description: 'corta',
          description: '<p>Descripción <strong>rica</strong></p>',
          base_price: '10',
          stock: '1',
          category_id: '1',
        }}
      />,
    ));

    const editor = screen.getByRole('textbox', { name: 'Descripción del producto' });
    expect(editor.innerHTML).toBe('<p>Descripción <strong>rica</strong></p>');
  });

  it('al editar en el RichTextEditor, el HTML viaja en el payload de onSubmit', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(wrap(
      <AdminProductForm
        onSubmit={onSubmit}
        initialValues={{
          name: 'Collar valido',
          short_description: 'corta',
          base_price: '10',
          stock: '1',
          category_id: '1',
        }}
      />,
    ));

    // Simula la edición: el RichTextEditor emite onChange con su innerHTML
    // tras un evento input sobre el área contentEditable.
    const editor = screen.getByRole('textbox', { name: 'Descripción del producto' });
    editor.innerHTML = '<p>Texto <em>enriquecido</em></p>';
    fireEvent.input(editor);

    fireEvent.click(screen.getByRole('button', { name: /Crear producto/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.description).toBe('<p>Texto <em>enriquecido</em></p>');
  });
});
