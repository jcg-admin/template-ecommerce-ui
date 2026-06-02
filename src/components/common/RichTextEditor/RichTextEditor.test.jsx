/**
 * Tests: RichTextEditor — UC-ADM-RTE
 * Editor de texto enriquecido nativo (contentEditable + toolbar).
 * TDD estricto: este archivo se escribe ANTES de la implementación.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import RichTextEditor from './index';

// jsdom no implementa document.execCommand: lo mockeamos para poder
// verificar que la toolbar lo invoca con los comandos correctos.
beforeEach(() => {
  document.execCommand = jest.fn(() => true);
});

describe('RichTextEditor', () => {
  it('renderiza de forma segura con value vacío', () => {
    render(<RichTextEditor value="" ariaLabel="Descripción" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('el área editable es accesible (role/aria/contentEditable)', () => {
    render(<RichTextEditor value="" ariaLabel="Descripción" />);
    const box = screen.getByRole('textbox');
    expect(box).toHaveAttribute('aria-multiline', 'true');
    expect(box).toHaveAttribute('aria-label', 'Descripción');
    expect(box).toHaveAttribute('contenteditable', 'true');
  });

  it('sincroniza el value entrante en el innerHTML del área editable', () => {
    render(<RichTextEditor value="<p>Hola</p>" ariaLabel="Desc" />);
    expect(screen.getByRole('textbox').innerHTML).toBe('<p>Hola</p>');
  });

  it('actualiza el contenido cuando cambia el prop value', () => {
    const { rerender } = render(<RichTextEditor value="<p>uno</p>" ariaLabel="Desc" />);
    expect(screen.getByRole('textbox').innerHTML).toBe('<p>uno</p>');
    rerender(<RichTextEditor value="<p>dos</p>" ariaLabel="Desc" />);
    expect(screen.getByRole('textbox').innerHTML).toBe('<p>dos</p>');
  });

  it('muestra placeholder cuando no hay contenido', () => {
    render(<RichTextEditor value="" placeholder="Escribe aquí…" ariaLabel="Desc" />);
    expect(screen.getByText('Escribe aquí…')).toBeInTheDocument();
  });

  it('la toolbar tiene botones type="button" con aria-label', () => {
    render(<RichTextEditor value="" ariaLabel="Desc" />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('type', 'button');
      expect(btn).toHaveAttribute('aria-label');
    });
  });

  it('el botón negrita invoca execCommand("bold")', () => {
    render(<RichTextEditor value="" ariaLabel="Desc" />);
    fireEvent.click(screen.getByLabelText('Negrita'));
    expect(document.execCommand).toHaveBeenCalledWith('bold', false, undefined);
  });

  it('el botón cursiva invoca execCommand("italic")', () => {
    render(<RichTextEditor value="" ariaLabel="Desc" />);
    fireEvent.click(screen.getByLabelText('Cursiva'));
    expect(document.execCommand).toHaveBeenCalledWith('italic', false, undefined);
  });

  it('el botón lista invoca execCommand("insertUnorderedList")', () => {
    render(<RichTextEditor value="" ariaLabel="Desc" />);
    fireEvent.click(screen.getByLabelText('Lista con viñetas'));
    expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false, undefined);
  });

  it('el botón enlace invoca execCommand("createLink") con la URL', () => {
    window.prompt = jest.fn(() => 'https://example.com');
    render(<RichTextEditor value="" ariaLabel="Desc" />);
    fireEvent.click(screen.getByLabelText('Enlace'));
    expect(document.execCommand).toHaveBeenCalledWith('createLink', false, 'https://example.com');
  });

  it('el botón enlace no invoca execCommand si se cancela el prompt', () => {
    window.prompt = jest.fn(() => null);
    render(<RichTextEditor value="" ariaLabel="Desc" />);
    fireEvent.click(screen.getByLabelText('Enlace'));
    expect(document.execCommand).not.toHaveBeenCalledWith('createLink', false, null);
  });

  it('emite onChange con el innerHTML tras un input del área editable', () => {
    const onChange = jest.fn();
    render(<RichTextEditor value="" onChange={onChange} ariaLabel="Desc" />);
    const box = screen.getByRole('textbox');
    box.innerHTML = '<b>texto</b>';
    fireEvent.input(box);
    expect(onChange).toHaveBeenCalledWith('<b>texto</b>');
  });

  it('aplica un comando de formato y emite onChange tras el input resultante', () => {
    const onChange = jest.fn();
    render(<RichTextEditor value="" onChange={onChange} ariaLabel="Desc" />);
    fireEvent.click(screen.getByLabelText('Negrita'));
    const box = screen.getByRole('textbox');
    box.innerHTML = '<b></b>';
    fireEvent.input(box);
    expect(onChange).toHaveBeenLastCalledWith('<b></b>');
  });
});
