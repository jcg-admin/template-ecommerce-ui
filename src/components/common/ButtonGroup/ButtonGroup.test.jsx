/**
 * ButtonGroup — pruebas (admin toolbars / filter bars)
 * Componente nativo, sin dependencias. Dos modos: wrapper y selector.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ButtonGroup from './index';

const ITEMS = [
  { label: 'Día', value: 'day' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
];

describe('ButtonGroup', () => {
  describe('modo wrapper presentacional', () => {
    it('renderiza un grupo accesible con el ariaLabel dado', () => {
      render(
        <ButtonGroup ariaLabel="Acciones">
          <button type="button">Uno</button>
          <button type="button">Dos</button>
        </ButtonGroup>,
      );
      expect(screen.getByRole('group', { name: 'Acciones' })).toBeInTheDocument();
    });

    it('renderiza los botones hijos', () => {
      render(
        <ButtonGroup ariaLabel="Acciones">
          <button type="button">Uno</button>
          <button type="button">Dos</button>
        </ButtonGroup>,
      );
      expect(screen.getByRole('button', { name: 'Uno' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Dos' })).toBeInTheDocument();
    });
  });

  describe('modo selector segmentado controlado', () => {
    it('renderiza un botón por cada item', () => {
      render(<ButtonGroup items={ITEMS} value="day" onChange={() => {}} ariaLabel="Rango" />);
      expect(screen.getByRole('button', { name: 'Día' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Semana' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Mes' })).toBeInTheDocument();
    });

    it('marca como pressed solo el item cuyo value coincide', () => {
      render(<ButtonGroup items={ITEMS} value="week" onChange={() => {}} ariaLabel="Rango" />);
      expect(screen.getByRole('button', { name: 'Día' })).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByRole('button', { name: 'Semana' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'Mes' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('con value que no coincide, ningún botón queda pressed', () => {
      render(<ButtonGroup items={ITEMS} value="otro" onChange={() => {}} ariaLabel="Rango" />);
      ITEMS.forEach(({ label }) => {
        expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'false');
      });
    });

    it('llama onChange con el value del item pulsado', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<ButtonGroup items={ITEMS} value="day" onChange={onChange} ariaLabel="Rango" />);
      await user.click(screen.getByRole('button', { name: 'Mes' }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('month');
    });

    it('no falla si onChange no se pasa (render seguro)', async () => {
      const user = userEvent.setup();
      render(<ButtonGroup items={ITEMS} value="day" ariaLabel="Rango" />);
      await user.click(screen.getByRole('button', { name: 'Semana' }));
      expect(screen.getByRole('button', { name: 'Semana' })).toBeInTheDocument();
    });

    it('los botones son type=button', () => {
      render(<ButtonGroup items={ITEMS} value="day" onChange={() => {}} ariaLabel="Rango" />);
      expect(screen.getByRole('button', { name: 'Día' })).toHaveAttribute('type', 'button');
    });
  });

  // Nota: los CSS Modules están mockeados a {} en Jest
  // (__mocks__/styleMock.js), así que styles.vertical === undefined y la
  // clase no es observable. La orientación se verifica vía el atributo
  // data-orientation, que sí refleja el prop de forma observable.
  describe('orientación', () => {
    it('usa orientación horizontal por defecto', () => {
      render(<ButtonGroup items={ITEMS} value="day" onChange={() => {}} ariaLabel="Rango" />);
      expect(screen.getByRole('group', { name: 'Rango' })).toHaveAttribute(
        'data-orientation', 'horizontal',
      );
    });

    it('refleja orientation="vertical"', () => {
      render(
        <ButtonGroup
          items={ITEMS}
          value="day"
          onChange={() => {}}
          orientation="vertical"
          ariaLabel="Rango"
        />,
      );
      expect(screen.getByRole('group', { name: 'Rango' })).toHaveAttribute(
        'data-orientation', 'vertical',
      );
    });
  });
});
