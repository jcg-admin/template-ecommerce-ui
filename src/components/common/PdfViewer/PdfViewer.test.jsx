/**
 * Tests: PdfViewer — visor de PDF nativo por URL (iframe).
 */
import { render, screen } from '@testing-library/react';
import PdfViewer from './index';

const URL = 'https://example.com/factura-123.pdf';

describe('PdfViewer', () => {
  it('con url renderiza un iframe cuyo src es la url y con title accesible', () => {
    render(<PdfViewer url={URL} title="Factura 123" />);
    const frame = screen.getByTitle('Factura 123');
    expect(frame.tagName).toBe('IFRAME');
    expect(frame).toHaveAttribute('src', URL);
  });

  it('usa título accesible por defecto cuando no se pasa title', () => {
    render(<PdfViewer url={URL} />);
    expect(screen.getByTitle('Documento PDF').tagName).toBe('IFRAME');
  });

  it('la acción "Descargar" apunta a la url', () => {
    render(<PdfViewer url={URL} />);
    const link = screen.getByRole('link', { name: /descargar/i });
    expect(link).toHaveAttribute('href', URL);
    expect(link).toHaveAttribute('download');
  });

  it('la acción "Abrir en pestaña nueva" apunta a la url con seguridad', () => {
    render(<PdfViewer url={URL} />);
    const link = screen.getByRole('link', { name: /abrir/i });
    expect(link).toHaveAttribute('href', URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('sin url muestra el estado vacío (role=status) y NO renderiza iframe', () => {
    render(<PdfViewer />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('No hay documento disponible');
    expect(document.querySelector('iframe')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('aplica la altura indicada al cuerpo del visor', () => {
    const { container } = render(<PdfViewer url={URL} height={400} />);
    const body = container.querySelector('iframe').parentElement;
    expect(body).toHaveStyle({ height: '400px' });
  });
});
