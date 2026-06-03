/**
 * ViewToggle — pruebas (UC-CAT-LIST)
 * Conmutador de vista grid <-> lista. Componente nativo, sin dependencias.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewToggle from './index';

describe('ViewToggle', () => {
  it('renderiza un grupo accesible con el ariaLabel dado', () => {
    render(<ViewToggle value="grid" onChange={() => {}} ariaLabel="Vista del catálogo" />);
    const group = screen.getByRole('group', { name: 'Vista del catálogo' });
    expect(group).toBeInTheDocument();
  });

  it('renderiza dos botones type=button con etiquetas accesibles', () => {
    render(<ViewToggle value="grid" onChange={() => {}} ariaLabel="Vista del catálogo" />);
    const gridBtn = screen.getByRole('button', { name: 'Vista de cuadrícula' });
    const listBtn = screen.getByRole('button', { name: 'Vista de lista' });
    expect(gridBtn).toHaveAttribute('type', 'button');
    expect(listBtn).toHaveAttribute('type', 'button');
  });

  it('marca el botón activo con aria-pressed="true" y el otro en false (value=grid)', () => {
    render(<ViewToggle value="grid" onChange={() => {}} ariaLabel="Vista del catálogo" />);
    expect(screen.getByRole('button', { name: 'Vista de cuadrícula' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Vista de lista' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('marca el botón activo con aria-pressed="true" (value=list)', () => {
    render(<ViewToggle value="list" onChange={() => {}} ariaLabel="Vista del catálogo" />);
    expect(screen.getByRole('button', { name: 'Vista de lista' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Vista de cuadrícula' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('llama onChange con "list" al pulsar el botón de lista', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<ViewToggle value="grid" onChange={onChange} ariaLabel="Vista del catálogo" />);
    await user.click(screen.getByRole('button', { name: 'Vista de lista' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('list');
  });

  it('llama onChange con "grid" al pulsar el botón de cuadrícula', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<ViewToggle value="list" onChange={onChange} ariaLabel="Vista del catálogo" />);
    await user.click(screen.getByRole('button', { name: 'Vista de cuadrícula' }));
    expect(onChange).toHaveBeenCalledWith('grid');
  });

  it('no falla si onChange no se pasa (render seguro)', async () => {
    const user = userEvent.setup();
    render(<ViewToggle value="grid" ariaLabel="Vista del catálogo" />);
    await user.click(screen.getByRole('button', { name: 'Vista de lista' }));
    expect(screen.getByRole('button', { name: 'Vista de lista' })).toBeInTheDocument();
  });

  it('con value inválido, ningún botón queda marcado como activo', () => {
    render(<ViewToggle value="otro" onChange={() => {}} ariaLabel="Vista del catálogo" />);
    expect(screen.getByRole('button', { name: 'Vista de cuadrícula' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Vista de lista' })).toHaveAttribute('aria-pressed', 'false');
  });
});
