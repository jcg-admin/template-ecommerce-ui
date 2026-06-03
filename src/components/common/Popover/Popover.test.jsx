/**
 * Tests: Popover — extiende Tooltip (ui-core popover.js)
 * Iniciativa: implementar-componentes-diferidos-ui-core
 */
import { render, screen, fireEvent, act } from '@testing-library/react';
import Popover from './Popover';

// Al abrir el panel, floating-ui (whileElementsMounted: autoUpdate)
// recalcula la posición de forma asíncrona y dispara un setState de
// floatingStyles después del fireEvent síncrono. openPanel envuelve la
// interacción y deja que ese update asíncrono se asiente dentro de act,
// evitando el warning "not wrapped in act".
const openPanel = async (el) => {
  await act(async () => {
    fireEvent.click(el);
  });
};

describe('Popover', () => {
  it('no muestra el panel por defecto', () => {
    render(<Popover content="Cuerpo"><button>Trigger</button></Popover>);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('trigger=click abre el panel al hacer click (default de ui-core)', async () => {
    render(<Popover content="Contenido"><button>Abrir</button></Popover>);
    await openPanel(screen.getByText('Abrir').closest('span'));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('segundo click cierra el panel (toggle)', async () => {
    render(<Popover content="Info"><button>Toggle</button></Popover>);
    const wrapper = screen.getByText('Toggle').closest('span');
    await openPanel(wrapper);
    await act(async () => { fireEvent.click(wrapper); });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('muestra header (popover-header) cuando se pasa title', async () => {
    render(<Popover content="Cuerpo" title="Título"><button>T</button></Popover>);
    await openPanel(screen.getByText('T').closest('span'));
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Cuerpo')).toBeInTheDocument();
  });

  it('sin title no renderiza header (equivale a _isWithContent)', async () => {
    render(<Popover content="Solo cuerpo"><button>T</button></Popover>);
    await openPanel(screen.getByText('T').closest('span'));
    expect(screen.queryByText('Título')).not.toBeInTheDocument();
  });

  it('content como función se resuelve al abrir', async () => {
    const contentFn = () => 'Contenido dinámico';
    render(<Popover content={contentFn}><button>T</button></Popover>);
    await openPanel(screen.getByText('T').closest('span'));
    expect(screen.getByText('Contenido dinámico')).toBeInTheDocument();
  });

  it('Escape cierra el panel', async () => {
    render(<Popover content="Info"><button>T</button></Popover>);
    await openPanel(screen.getByText('T').closest('span'));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await act(async () => { fireEvent.keyDown(document, { key: 'Escape' }); });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('trigger=hover abre con mouseenter', async () => {
    render(<Popover content="Info" trigger="hover"><button>T</button></Popover>);
    await act(async () => {
      fireEvent.mouseEnter(screen.getByText('T').closest('span'));
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });
});
