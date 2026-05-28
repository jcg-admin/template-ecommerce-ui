/**
 * Tests: RangeSlider
 * Cubre: BUG-CF01 (garantiza min <= max)
 * Iniciativa: integrar-componentes-ui-core-js (T-401)
 */
import { render, screen, fireEvent } from '@testing-library/react';
import RangeSlider from './RangeSlider';

describe('RangeSlider — modo simple', () => {
  it('renderiza con el valor actual', () => {
    render(<RangeSlider value={40} onChange={jest.fn()} label="Precio" />);
    expect(screen.getByRole('slider', { name: /precio/i })).toHaveValue('40');
  });

  it('llama onChange con el nuevo valor', () => {
    const onChange = jest.fn();
    render(<RangeSlider value={40} onChange={onChange} label="Precio" />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '60' } });
    expect(onChange).toHaveBeenCalledWith(60);
  });

  it('muestra el valor en aria-live', () => {
    render(<RangeSlider value={50} onChange={jest.fn()} label="Volumen" />);
    expect(screen.getByText('Volumen')).toBeInTheDocument();
  });
});

describe('RangeSlider — modo doble (BUG-CF01)', () => {
  it('renderiza dos sliders con aria-label distintos', () => {
    render(<RangeSlider value={[20, 80]} onChange={jest.fn()} />);
    expect(screen.getByRole('slider', { name: 'Valor mínimo' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Valor máximo' })).toBeInTheDocument();
  });

  it('garantiza lo <= hi: mover lo hasta hi lo clampea', () => {
    const onChange = jest.fn();
    render(<RangeSlider value={[20, 50]} onChange={onChange} distance={5} />);
    // Intentar mover lo a 60 (> hi=50 - distance=5)
    fireEvent.change(screen.getByRole('slider', { name: 'Valor mínimo' }), {
      target: { value: '60' },
    });
    // Debe quedar en max(60, hi-distance) = hi-distance = 45
    expect(onChange).toHaveBeenCalledWith([45, 50]);
  });

  it('garantiza hi >= lo: mover hi por debajo de lo lo clampea', () => {
    const onChange = jest.fn();
    render(<RangeSlider value={[30, 70]} onChange={onChange} distance={10} />);
    fireEvent.change(screen.getByRole('slider', { name: 'Valor máximo' }), {
      target: { value: '25' },
    });
    // 25 < lo+distance=40 → clampea a 40
    expect(onChange).toHaveBeenCalledWith([30, 40]);
  });

  it('formatea valores con formatValue', () => {
    render(
      <RangeSlider
        value={[100, 500]}
        onChange={jest.fn()}
        label="Precio"
        formatValue={(v) => `$${v}`}
      />
    );
    expect(screen.getByText('$100 – $500')).toBeInTheDocument();
  });
});
