/**
 * Tests: Card — contenedor de contenido nativo (sin deps).
 * Cubre modo simple (title/subtitle/children/footer + tone + as) y
 * modo composición vía subcomponentes (CardHeader/CardBody/CardFooter).
 */
import { render, screen } from '@testing-library/react';
import Card, { CardHeader, CardBody, CardFooter } from './index';

describe('Card', () => {
  it('renderiza title como heading accesible', () => {
    render(<Card title="Mi pedido">contenido</Card>);
    expect(
      screen.getByRole('heading', { name: 'Mi pedido' })
    ).toBeInTheDocument();
  });

  it('renderiza subtitle', () => {
    render(<Card title="T" subtitle="2 artículos">contenido</Card>);
    expect(screen.getByText('2 artículos')).toBeInTheDocument();
  });

  it('renderiza children (body)', () => {
    render(<Card title="T">cuerpo de la card</Card>);
    expect(screen.getByText('cuerpo de la card')).toBeInTheDocument();
  });

  it('renderiza footer', () => {
    render(
      <Card title="T" footer={<button type="button">Acción</button>}>
        cuerpo
      </Card>
    );
    expect(
      screen.getByRole('button', { name: 'Acción' })
    ).toBeInTheDocument();
  });

  it('omite el header cuando no hay title ni subtitle', () => {
    render(<Card>solo cuerpo</Card>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('solo cuerpo')).toBeInTheDocument();
  });

  it('expone el tone seleccionado', () => {
    render(<Card tone="vino" title="T">x</Card>);
    expect(screen.getByTestId('card')).toHaveAttribute('data-tone', 'vino');
  });

  it('cae a tone default ante un tone inválido', () => {
    render(<Card tone="inexistente" title="T">x</Card>);
    expect(screen.getByTestId('card')).toHaveAttribute('data-tone', 'default');
  });

  it('renderiza un <section> por defecto', () => {
    render(<Card title="T">x</Card>);
    expect(screen.getByTestId('card').tagName).toBe('SECTION');
  });

  it('la prop `as` cambia el elemento del contenedor', () => {
    render(<Card as="article" title="T">x</Card>);
    expect(screen.getByTestId('card').tagName).toBe('ARTICLE');
  });

  describe('composición vía subcomponentes', () => {
    it('renderiza CardHeader/CardBody/CardFooter', () => {
      render(
        <Card>
          <CardHeader>
            <h3>Encabezado propio</h3>
          </CardHeader>
          <CardBody>cuerpo propio</CardBody>
          <CardFooter>
            <button type="button">Guardar</button>
          </CardFooter>
        </Card>
      );

      expect(
        screen.getByRole('heading', { name: 'Encabezado propio' })
      ).toBeInTheDocument();
      expect(screen.getByText('cuerpo propio')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Guardar' })
      ).toBeInTheDocument();
    });
  });
});
