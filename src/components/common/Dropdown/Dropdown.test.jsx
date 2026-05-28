/**
 * Tests: Dropdown
 * Iniciativa: integrar-componentes-ui-core-js (T-301)
 */
import { render, screen, fireEvent } from '@testing-library/react';
import Dropdown, { DropdownItem, DropdownDivider } from './Dropdown';

// jsdom no implementa la Popover API — mockear
beforeEach(() => {
  HTMLElement.prototype.togglePopover = jest.fn(function() {
    if (this.hasAttribute('popover')) {
      this.toggleAttribute('data-popover-open');
    }
  });
  HTMLElement.prototype.showPopover = jest.fn();
  HTMLElement.prototype.hidePopover = jest.fn();
});

describe('Dropdown', () => {
  it('renderiza el trigger y el panel', () => {
    render(
      <Dropdown trigger={<button>Abrir</button>}>
        <DropdownItem>Opción 1</DropdownItem>
      </Dropdown>
    );
    expect(screen.getByText('Abrir')).toBeInTheDocument();
    expect(screen.getByText('Opción 1')).toBeInTheDocument();
  });

  it('panel tiene role=menu', () => {
    render(<Dropdown trigger={<span>T</span>}><span>item</span></Dropdown>);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('DropdownItem llama onClick al hacer click', () => {
    const onClick = jest.fn();
    render(
      <Dropdown trigger={<span>T</span>}>
        <DropdownItem onClick={onClick}>Acción</DropdownItem>
      </Dropdown>
    );
    fireEvent.click(screen.getByRole('menuitem'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('DropdownItem deshabilitado no responde al click', () => {
    const onClick = jest.fn();
    render(
      <Dropdown trigger={<span>T</span>}>
        <DropdownItem onClick={onClick} disabled>Deshabilitado</DropdownItem>
      </Dropdown>
    );
    expect(screen.getByRole('menuitem')).toBeDisabled();
  });

  it('DropdownDivider tiene role=separator', () => {
    render(
      <Dropdown trigger={<span>T</span>}>
        <DropdownDivider />
      </Dropdown>
    );
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('panel tiene atributo popover=auto', () => {
    render(<Dropdown trigger={<span>T</span>}><span>x</span></Dropdown>);
    expect(screen.getByRole('menu').closest('[popover]')).toHaveAttribute('popover', 'auto');
  });
});
