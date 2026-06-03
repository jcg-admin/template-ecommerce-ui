/**
 * Tests: Sidebar — API completa de ui-core sidebar.js
 */
import { render, screen, act } from '@testing-library/react';
import { createRef } from 'react';
import Sidebar, { SidebarNav, SidebarNavItem, SidebarBrand } from './Sidebar';

describe('Sidebar — API completa ui-core', () => {
  it('renderiza los hijos cuando open=true', () => {
    render(<Sidebar defaultOpen><p>Menú</p></Sidebar>);
    expect(screen.getByText('Menú')).toBeInTheDocument();
  });

  it('sidebar no-overlaid siempre renderiza (open controla CSS)', () => {
    // En modo desktop, el sidebar está siempre en el DOM
    // open=false solo aplica la clase sidebarHidden
    render(<Sidebar defaultOpen={false}><p>Oculto</p></Sidebar>);
    expect(screen.getByText('Oculto')).toBeInTheDocument();
  });

  it('ref.hide() cambia el estado a cerrado', () => {
    const ref = createRef();
    render(<Sidebar defaultOpen ref={ref}><p>Contenido</p></Sidebar>);
    act(() => ref.current.hide());
    // Para sidebar no-overlaid, el contenido sigue en DOM (CSS oculto)
    expect(ref.current.isOpen()).toBe(false);
  });

  it('ref.show() abre el sidebar', () => {
    const ref = createRef();
    render(<Sidebar defaultOpen={false} ref={ref}><p>Contenido</p></Sidebar>);
    act(() => ref.current.show());
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('ref.toggle() alterna el estado (verifica isOpen)', () => {
    const ref = createRef();
    render(<Sidebar defaultOpen ref={ref}><p>Contenido</p></Sidebar>);
    expect(ref.current.isOpen()).toBe(true);
    act(() => ref.current.toggle());
    expect(ref.current.isOpen()).toBe(false);
    act(() => ref.current.toggle());
    expect(ref.current.isOpen()).toBe(true);
  });

  it('ref.narrow() activa el modo estrecho', () => {
    const ref = createRef();
    render(<Sidebar defaultOpen ref={ref}><p>C</p></Sidebar>);
    act(() => ref.current.narrow());
    expect(ref.current.isNarrow()).toBe(true);
  });

  it('ref.toggleNarrow() alterna el modo estrecho', () => {
    const ref = createRef();
    render(<Sidebar defaultOpen ref={ref}><p>C</p></Sidebar>);
    act(() => ref.current.toggleNarrow());
    expect(ref.current.isNarrow()).toBe(true);
    act(() => ref.current.toggleNarrow());
    expect(ref.current.isNarrow()).toBe(false);
  });

  it('ref.reset() restaura el estado por defecto', () => {
    const ref = createRef();
    render(<Sidebar defaultOpen ref={ref}><p>C</p></Sidebar>);
    act(() => ref.current.narrow());
    act(() => ref.current.reset());
    expect(ref.current.isNarrow()).toBe(false);
  });

  it('SidebarNav + SidebarNavItem renderizan la navegación', () => {
    render(
      <Sidebar defaultOpen>
        <SidebarNav>
          <SidebarNavItem href="/home" active>Inicio</SidebarNavItem>
          <SidebarNavItem href="/admin">Admin</SidebarNavItem>
        </SidebarNav>
      </Sidebar>
    );
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inicio' }))
      .toHaveAttribute('aria-current', 'page');
  });

  it('SidebarBrand renderiza el logo', () => {
    render(<Sidebar defaultOpen><SidebarBrand>Mi App</SidebarBrand></Sidebar>);
    expect(screen.getByText('Mi App')).toBeInTheDocument();
  });

  it('ref expone todos los métodos públicos de ui-core', () => {
    const ref = createRef();
    render(<Sidebar defaultOpen ref={ref}><p>C</p></Sidebar>);
    ['show','hide','toggle','narrow','unfoldable','reset','toggleNarrow','toggleUnfoldable']
      .forEach(m => expect(typeof ref.current?.[m]).toBe('function'));
  });
});
