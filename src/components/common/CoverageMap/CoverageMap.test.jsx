/**
 * CoverageMap — pruebas (UC-LOG-MAP)
 * Mapa de cobertura de envío como SVG estático (sin tiles ni servicios
 * externos). Componente nativo, sin dependencias. TDD estricto.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CoverageMap from './index';

const ZONES = [
  { id: 'n', name: 'Norte', covered: true },
  { id: 's', name: 'Sur', covered: false },
  { id: 'e', name: 'Este', covered: true },
];

describe('CoverageMap', () => {
  it('renderiza un SVG accesible con el ariaLabel dado', () => {
    render(<CoverageMap zones={ZONES} ariaLabel="Cobertura de envío" />);
    const svg = screen.getByRole('img', { name: 'Cobertura de envío' });
    expect(svg.tagName.toLowerCase()).toBe('svg');
  });

  it('renderiza una región accesible por cada zona', () => {
    render(<CoverageMap zones={ZONES} ariaLabel="Cobertura de envío" />);
    expect(screen.getByRole('img', { name: 'Norte: cubierta' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Sur: no cubierta' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Este: cubierta' })).toBeInTheDocument();
  });

  it('distingue visualmente las zonas cubiertas de las no cubiertas', () => {
    render(<CoverageMap zones={ZONES} ariaLabel="Cobertura de envío" />);
    const covered = screen.getByRole('img', { name: 'Norte: cubierta' });
    const uncovered = screen.getByRole('img', { name: 'Sur: no cubierta' });
    // En tests los CSS Modules están mockeados, así que la distinción visual
    // se verifica mediante data-covered (la clase real difiere en el build).
    expect(covered).toHaveAttribute('data-covered', 'true');
    expect(uncovered).toHaveAttribute('data-covered', 'false');
  });

  it('renderiza una leyenda con cubierta y no cubierta', () => {
    render(<CoverageMap zones={ZONES} ariaLabel="Cobertura de envío" />);
    expect(screen.getByText('Cubierta')).toBeInTheDocument();
    expect(screen.getByText('No cubierta')).toBeInTheDocument();
  });

  it('llama onZoneClick con el id de la zona al pulsarla', async () => {
    const onZoneClick = jest.fn();
    const user = userEvent.setup();
    render(<CoverageMap zones={ZONES} onZoneClick={onZoneClick} ariaLabel="Cobertura de envío" />);
    await user.click(screen.getByRole('img', { name: 'Sur: no cubierta' }));
    expect(onZoneClick).toHaveBeenCalledTimes(1);
    expect(onZoneClick).toHaveBeenCalledWith('s');
  });

  it('no falla si onZoneClick no se proporciona', async () => {
    const user = userEvent.setup();
    render(<CoverageMap zones={ZONES} ariaLabel="Cobertura de envío" />);
    await user.click(screen.getByRole('img', { name: 'Norte: cubierta' }));
    expect(screen.getByRole('img', { name: 'Cobertura de envío' })).toBeInTheDocument();
  });

  it('renderiza de forma segura con zones vacío', () => {
    render(<CoverageMap zones={[]} ariaLabel="Cobertura de envío" />);
    expect(screen.getByRole('img', { name: 'Cobertura de envío' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /cubierta$/ })).not.toBeInTheDocument();
  });

  it('renderiza de forma segura sin la prop zones', () => {
    render(<CoverageMap ariaLabel="Cobertura de envío" />);
    expect(screen.getByRole('img', { name: 'Cobertura de envío' })).toBeInTheDocument();
  });
});
