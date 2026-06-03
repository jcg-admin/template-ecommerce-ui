/**
 * Tests — cartSlice reducer
 * ecommerce-ui UI
 */

import cartReducer, {
  clearCart,
  addToCart,
  removeCartItem,
  applyVoucher,
} from '../../../src/redux/slices/cartSlice';

const EMPTY_TOTALS = {
  subtotal: 0,
  discount: 0,
  subtotal_net: 0,
  tax_included: 0,
  tax: 0,
  shipping_cost: null,
  total: 0,
  free_shipping_threshold: null,
  free_shipping_remaining: null,
  free_shipping_applied: false,
  item_count: 0,
};

const INITIAL_STATE = {
  items: [],
  voucher: null,
  totals: { ...EMPTY_TOTALS },
  itemCount: 0,
  isLoading: false,
  error: null,
  isActioning: false,
  actionError: null,
  lastAction: null,
  // UC-LOG-09 — cotizacion de envio.
  shippingQuote: null,
  isQuoting: false,
  quoteError: null,
};

// Items con el contrato real (product_name / unit_price). El modelo es
// tax-INCLUSIVO: el IVA ya esta dentro de unit_price, total == subtotal_net.
const ITEM_A = { id: 1, product_id: 10, product_name: 'Collar Oshun', unit_price: '350.00', quantity: 2 };
const ITEM_B = { id: 2, product_id: 20, product_name: 'Pulsera Elegua', unit_price: '180.00', quantity: 1 };

// totals tal como los serializa el server (modelo tax-inclusivo).
// subtotal = 350*2 + 180*1 = 880; total = subtotal_net = 880;
// tax_included = 880 * 0.16/1.16 = 121.38 (informativo).
const TOTALS_AB = {
  subtotal: '880.00', discount: '0.00', subtotal_net: '880.00',
  tax_included: '121.38', shipping_cost: null, total: '880.00',
  free_shipping_threshold: '1500.00', free_shipping_remaining: '620.00',
  free_shipping_applied: false, item_count: 3,
};

describe('cartSlice', () => {
  describe('estado inicial', () => {
    it('debe devolver el estado inicial', () => {
      expect(cartReducer(undefined, { type: '@@INIT' })).toEqual(INITIAL_STATE);
    });
  });

  describe('clearCart', () => {
    it('debe vaciar el carrito', () => {
      const state = {
        ...INITIAL_STATE,
        items: [ITEM_A],
        itemCount: 2,
        totals: { ...EMPTY_TOTALS, subtotal: 700, subtotal_net: 700, total: 700 },
      };
      const next = cartReducer(state, clearCart());
      expect(next.items).toHaveLength(0);
      expect(next.itemCount).toBe(0);
      expect(next.totals.total).toBe(0);
    });
  });

  describe('addToCart thunk', () => {
    it('pending — debe poner isLoading en true', () => {
      const action = { type: addToCart.pending.type };
      const next   = cartReducer(INITIAL_STATE, action);
      expect(next.isLoading).toBe(true);
    });

    it('fulfilled — debe actualizar items y totales desde el payload', () => {
      const cartPayload = {
        items:   [ITEM_A, ITEM_B],
        voucher: null,
        totals:  TOTALS_AB,
      };
      const action = { type: addToCart.fulfilled.type, payload: cartPayload };
      const next   = cartReducer(INITIAL_STATE, action);

      expect(next.items).toHaveLength(2);
      // 350*2 + 180*1 = 880 subtotal. Modelo tax-inclusivo: total == subtotal_net.
      expect(next.totals.subtotal).toBe(880);
      expect(next.totals.total).toBe(880);
      // tax_included es informativo (IVA ya incluido), NO se suma al total.
      expect(next.totals.tax_included).toBeCloseTo(121.38, 2);
      expect(next.itemCount).toBe(3); // item_count del server
      expect(next.isLoading).toBe(false);
    });

    it('rejected — debe guardar el error', () => {
      const action = { type: addToCart.rejected.type, payload: 'Sin stock' };
      const next   = cartReducer(INITIAL_STATE, action);
      expect(next.error).toBe('Sin stock');
      expect(next.isLoading).toBe(false);
    });
  });

  describe('removeCartItem thunk', () => {
    it('fulfilled — debe eliminar el item por id', () => {
      const state = {
        ...INITIAL_STATE,
        items: [ITEM_A, ITEM_B],
        itemCount: 3,
      };
      const action = { type: removeCartItem.fulfilled.type, payload: 1 };
      const next   = cartReducer(state, action);

      expect(next.items).toHaveLength(1);
      expect(next.items[0].id).toBe(2);
    });
  });

  describe('applyVoucher thunk', () => {
    it('fulfilled — debe aplicar el voucher y tomar totales del server', () => {
      const voucher = { code: 'DEMO10', type: 'PERCENT', value: 10 };
      // El server recalcula totals.discount y los devuelve en el payload.
      // subtotal 700, discount 70, subtotal_net = total = 630 (tax-inclusivo).
      // tax_included = 630 * 0.16/1.16 = 86.90 (informativo, NO se suma).
      const cartPayload = {
        items:   [ITEM_A],   // 350 * 2 = 700 subtotal
        voucher,
        totals: {
          subtotal: '700.00', discount: '70.00', subtotal_net: '630.00',
          tax_included: '86.90', shipping_cost: null, total: '630.00',
          free_shipping_threshold: '1500.00', free_shipping_remaining: '870.00',
          free_shipping_applied: false, item_count: 2,
        },
      };
      const action = { type: applyVoucher.fulfilled.type, payload: cartPayload };
      const next   = cartReducer(INITIAL_STATE, action);

      expect(next.voucher).toEqual(voucher);
      // Descuento = 700 * 10% = 70 (del server)
      expect(next.totals.discount).toBeCloseTo(70);
      // total == subtotal_net (IVA incluido, no se suma)
      expect(next.totals.total).toBeCloseTo(630);
      // tax_included informativo
      expect(next.totals.tax_included).toBeCloseTo(86.90, 2);
    });

    it('rejected — debe guardar el error de voucher inválido en actionError', () => {
      const action = { type: applyVoucher.rejected.type, payload: 'Voucher expirado' };
      const next   = cartReducer(INITIAL_STATE, action);
      expect(next.actionError).toBe('Voucher expirado');
    });
  });
});
