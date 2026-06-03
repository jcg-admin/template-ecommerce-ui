/**
 * Tests generateInvoicePdf — UC-ORD-PDFGEN.
 *
 * Nota jsdom: el Blob de jspdf no expone arrayBuffer()/text() de forma fiable,
 * asi que se verifica el contrato (tipo, tamano, no-lanza) en vez de los bytes.
 */
import { generateInvoicePdf, invoicePdfUrl } from './generateInvoicePdf';

const ORDER = {
  order_number: 'ORD-1234',
  created_at: '2026-05-10T10:00:00Z',
  items: [
    { id: 1, product_name: 'Collar Oshun', quantity: 2, unit_price: 500 },
    { id: 2, product_name: 'Eleke', quantity: 1, unit_price: 300 },
  ],
  subtotal: 1300,
  tax: 208,
  discount: 0,
  total: 1508,
};

describe('generateInvoicePdf (UC-ORD-PDFGEN)', () => {
  it('devuelve un Blob PDF con contenido', () => {
    const blob = generateInvoicePdf(ORDER);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(800); // un PDF real con texto
  });

  it('no falla con un pedido minimo / vacio y sigue siendo PDF', () => {
    expect(() => generateInvoicePdf({})).not.toThrow();
    expect(() => generateInvoicePdf()).not.toThrow();
    expect(generateInvoicePdf({}).type).toBe('application/pdf');
  });

  it('invoicePdfUrl crea un object URL a partir del Blob', () => {
    const original = URL.createObjectURL;
    URL.createObjectURL = jest.fn(() => 'blob:fake');
    try {
      const url = invoicePdfUrl(ORDER);
      expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(url).toBe('blob:fake');
    } finally {
      URL.createObjectURL = original;
    }
  });
});
