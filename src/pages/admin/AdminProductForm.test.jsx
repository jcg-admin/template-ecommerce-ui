/**
 * Tests — AdminProductForm (UC-ADM-RTE / F5-T5)
 *
 * Verifica la integración del RichTextEditor en el campo de descripción
 * completa del producto, reemplazando el textarea plano. Cubre:
 *   - El RichTextEditor está presente (role="textbox" + aria-label).
 *   - Editar en el editor enriquecido actualiza el estado y llega como
 *     HTML al payload de onSubmit.
 */
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// El form carga categorías vía react-query; mockeamos el hook para no
// depender de la red en estos tests centrados en el RichTextEditor.
// Se proveen varias categorías para ejercitar el DualListBox (UC-ADM-LISTBOX).
jest.mock('@hooks/domain/useCategories', () => ({
  __esModule: true,
  useAdminCategories: () => ({
    data: {
      results: [
        { id: 1, name: 'Collares', is_active: true },
        { id: 2, name: 'Elekes', is_active: true },
        { id: 3, name: 'Soperas', is_active: true },
      ],
    },
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

describe('AdminProductForm — DualListBox de categorías (UC-ADM-LISTBOX)', () => {
  it('renderiza el DualListBox con las dos listas (Disponibles / Asignadas)', () => {
    render(wrap(<AdminProductForm onSubmit={jest.fn()} />));

    expect(
      screen.getByRole('group', { name: 'Categorías del producto' }),
    ).toBeInTheDocument();

    const available = screen.getByRole('listbox', { name: 'Disponibles' });
    const assigned = screen.getByRole('listbox', { name: 'Asignadas' });
    expect(available).toBeInTheDocument();
    expect(assigned).toBeInTheDocument();

    // Sin selección inicial, todas las categorías están en "Disponibles".
    expect(within(available).getByRole('option', { name: 'Categoría: Collares' })).toBeInTheDocument();
    expect(within(available).getByRole('option', { name: 'Categoría: Elekes' })).toBeInTheDocument();
    expect(within(available).getByRole('option', { name: 'Categoría: Soperas' })).toBeInTheDocument();
    expect(within(assigned).queryAllByRole('option')).toHaveLength(0);
  });

  it('precarga las categorías asignadas desde initialValues.category_ids', () => {
    render(wrap(
      <AdminProductForm
        onSubmit={jest.fn()}
        initialValues={{ category_ids: [2] }}
      />,
    ));

    const assigned = screen.getByRole('listbox', { name: 'Asignadas' });
    expect(within(assigned).getByRole('option', { name: 'Categoría: Elekes' })).toBeInTheDocument();
  });

  it('mover un ítem actualiza la selección y viaja en el payload de onSubmit', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(wrap(
      <AdminProductForm
        onSubmit={onSubmit}
        initialValues={{
          name: 'Collar valido',
          short_description: 'corta',
          description: '<p>desc</p>',
          base_price: '10',
          stock: '1',
          category_id: '1',
        }}
      />,
    ));

    // Mueve "Elekes" de Disponibles a Asignadas con su botón por-ítem.
    fireEvent.click(screen.getByRole('button', { name: 'Añadir Categoría: Elekes' }));

    // Ahora aparece en la lista de Asignadas.
    const assigned = screen.getByRole('listbox', { name: 'Asignadas' });
    expect(within(assigned).getByRole('option', { name: 'Categoría: Elekes' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Crear producto/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.category_ids).toEqual([2]);
  });
});
