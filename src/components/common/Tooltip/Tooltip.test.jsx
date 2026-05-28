import { render, screen, fireEvent, act } from '@testing-library/react';
import Tooltip from './Tooltip';

jest.useFakeTimers();

beforeEach(() => {
  HTMLElement.prototype.showPopover = jest.fn();
  HTMLElement.prototype.hidePopover = jest.fn();
});

describe('Tooltip', () => {
  it('renderiza el children y el contenido del tooltip', () => {
    render(<Tooltip content="Ayuda"><button>Botón</button></Tooltip>);
    expect(screen.getByText('Botón')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Ayuda');
  });

  it('muestra el tooltip tras delay en mouseenter', () => {
    render(<Tooltip content="Info" delay={300}><button>B</button></Tooltip>);
    fireEvent.mouseEnter(screen.getByText('B').parentElement);
    act(() => jest.advanceTimersByTime(300));
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
  });

  it('NO muestra el tooltip antes del delay', () => {
    render(<Tooltip content="Info" delay={300}><button>B</button></Tooltip>);
    fireEvent.mouseEnter(screen.getByText('B').parentElement);
    act(() => jest.advanceTimersByTime(100));
    expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
  });

  it('oculta en mouseleave', () => {
    render(<Tooltip content="Info"><button>B</button></Tooltip>);
    const wrapper = screen.getByText('B').parentElement;
    fireEvent.mouseEnter(wrapper);
    fireEvent.mouseLeave(wrapper);
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
  });

  it('tiene role=tooltip y aria-describedby', () => {
    render(<Tooltip content="Descripción"><button>B</button></Tooltip>);
    const tooltip = screen.getByRole('tooltip');
    const wrapper = tooltip.previousElementSibling;
    expect(wrapper).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('usa popover=manual para control programático', () => {
    render(<Tooltip content="X"><button>B</button></Tooltip>);
    expect(screen.getByRole('tooltip')).toHaveAttribute('popover', 'manual');
  });
});
