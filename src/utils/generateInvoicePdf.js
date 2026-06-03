/**
 * generateInvoicePdf — UC-ORD-PDFGEN.
 *
 * Genera la factura de un pedido como PDF en el CLIENTE, a partir de los datos
 * del pedido (sin backend). Usa jsPDF. Devuelve un Blob 'application/pdf' listo
 * para incrustar en PdfViewer (via URL.createObjectURL) o descargar.
 */
import { jsPDF } from 'jspdf';

function money(n) {
  const value = Number(n) || 0;
  return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * @param {object} order - pedido con order_number, created_at, items[], total, subtotal, tax, discount.
 * @returns {Blob} PDF de la factura.
 */
export function generateInvoicePdf(order = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const left = 48;
  let y = 64;

  doc.setFontSize(18);
  doc.text('Factura', left, y);
  doc.setFontSize(11);
  y += 24;
  doc.text(`Pedido: ${order.order_number ?? '-'}`, left, y);
  y += 16;
  const fecha = order.created_at ? new Date(order.created_at).toLocaleDateString('es-MX') : '-';
  doc.text(`Fecha: ${fecha}`, left, y);

  // Items
  y += 32;
  doc.setFontSize(12);
  doc.text('Concepto', left, y);
  doc.text('Cant.', 360, y);
  doc.text('Importe', 460, y);
  doc.setFontSize(11);
  (order.items ?? []).forEach((it) => {
    y += 18;
    const name = it.product_name ?? it.name ?? `Item ${it.id ?? ''}`;
    const qty = it.quantity ?? 1;
    const amount = (Number(it.unit_price) || 0) * qty;
    doc.text(String(name).slice(0, 48), left, y);
    doc.text(String(qty), 360, y);
    doc.text(money(amount), 460, y);
  });

  // Totales
  y += 32;
  if (order.subtotal != null) { doc.text(`Subtotal: ${money(order.subtotal)}`, 360, y); y += 16; }
  if (order.tax != null)      { doc.text(`Impuestos: ${money(order.tax)}`, 360, y); y += 16; }
  if (order.discount)         { doc.text(`Descuento: -${money(order.discount)}`, 360, y); y += 16; }
  doc.setFontSize(13);
  doc.text(`Total: ${money(order.total)}`, 360, y);

  return doc.output('blob');
}

/** Conveniencia: genera la factura y devuelve un object URL para incrustar/descargar. */
export function invoicePdfUrl(order) {
  return URL.createObjectURL(generateInvoicePdf(order));
}

export default generateInvoicePdf;
