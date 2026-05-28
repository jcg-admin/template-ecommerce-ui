/**
 * Tests: Sidebar
 * Cubre: BUG-S01 (scroll lock), BUG-S04 (backdrop accesible)
 * Iniciativa: integrar-componentes-ui-core-js (T-202)
 */
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';

describe('Sidebar', () => {
  it('renderiza children', () => {
    render(<Sidebar><nav>Nav content</nav></Sidebar>);
    expect(screen.getByText('Nav content')).toBeInTheDocument();
  });

  it('NO muestra backdrop cuando open=false', () => {
    render(<Sidebar open={false} onClose={jest.fn()}><span/></Sidebar>);
    expect(screen.queryByRole('button', { name: 'Cerrar menú' })).not.toBeInTheDocument();
  });

  it('muestra backdrop accesible cuando open=true', () => {
    render(<Sidebar open={true} onClose={jest.fn()}><span/></Sidebar>);
    const backdrop = screen.getByRole('button', { name: 'Cerrar menú' });
    expect(backdrop).toBeInTheDocument();
  });

  it('llama onClose al hacer click en el backdrop', () => {
    const onClose = jest.fn();
    render(<Sidebar open={true} onClose={onClose}><span/></Sidebar>);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('llama onClose al presionar Escape con open=true', () => {
    const onClose = jest.fn();
    render(<Sidebar open={true} onClose={onClose}><span/></Sidebar>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('tiene aria-label en el aside', () => {
    render(<Sidebar><span/></Sidebar>);
    expect(screen.getByRole('complementary', { name: 'Navegación lateral' })).toBeInTheDocument();
  });

  it('tiene data-narrow cuando narrow=true', () => {
    render(<Sidebar narrow={true}><span/></Sidebar>);
    expect(screen.getByRole('complementary')).toHaveAttribute('data-narrow', 'true');
  });
});
