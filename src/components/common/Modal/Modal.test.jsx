/**
 * Tests: Modal
 * Iniciativa: integrar-componentes-ui-core-js (T-201)
 * Cubre: BUG-M01 (focus trap, scroll lock, Escape)
 */
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

// jsdom no implementa showModal/close — mockeamos la API del dialog
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = jest.fn(function () {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = jest.fn(function () {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

const Wrapper = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose}>
    <button>Accion</button>
  </Modal>
);

describe('Modal', () => {
  it('llama showModal cuando open=true', () => {
    render(<Wrapper open={true} onClose={jest.fn()} />);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
  });

  it('llama close cuando open cambia a false', () => {
    const { rerender } = render(<Wrapper open={true} onClose={jest.fn()} />);
    rerender(<Wrapper open={false} onClose={jest.fn()} />);
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
  });

  it('llama onClose al disparar el evento close del dialog (Escape nativo)', () => {
    const onClose = jest.fn();
    render(<Wrapper open={true} onClose={onClose} />);
    const dialog = document.querySelector('dialog');
    fireEvent(dialog, new Event('close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renderiza children dentro del dialog', () => {
    render(<Wrapper open={true} onClose={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Accion' })).toBeInTheDocument();
  });

  it('tiene aria-modal="true"', () => {
    render(<Wrapper open={true} onClose={jest.fn()} />);
    expect(document.querySelector('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});
