/**
 * Cart Slice — ecommerce-ui
 *
 * UC-CART-01: Agregar producto al carrito (anonimo + autenticado).
 *
 * Maneja:
 *   - Items del carrito (producto + variante + cantidad)
 *   - Totales calculados (subtotal, descuento, IVA, total)
 *   - Voucher / cupon aplicado
 *   - Estado por accion (lastAction, isActioning, actionError) para UI
 *
 * API endpoints (English keys per DEC-DOC-005):
 *   GET    /api/v1/cart/            — leer carrito
 *   POST   /api/v1/cart/items/      — agregar producto (UC-CART-01)
 *   PATCH  /api/v1/cart/items/:id/  — cambiar cantidad
 *   DELETE /api/v1/cart/items/:id/  — eliminar item
 *   POST   /api/v1/cart/voucher/    — aplicar cupon
 *   DELETE /api/v1/cart/voucher/    — quitar cupon
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@services/apiService';
import { serializeApiError } from '@utils/serializeApiError';
import { withValidation, CommonValidators } from '@decorators/withValidation';

// ─── Endpoints ────────────────────────────────────────────────────────
const CART_URL          = '/api/v1/cart/';
const CART_ITEMS_URL    = '/api/v1/cart/items/';
const CART_ITEM_URL     = (id) => `/api/v1/cart/items/${id}/`;
const CART_VOUCHER_URL  = '/api/v1/cart/voucher/';
const CART_SAVE_URL     = '/api/v1/cart/save/';
const CART_MERGE_URL    = '/api/v1/cart/merge/';
const SHIPPING_QUOTE_URL = '/api/v1/logistics/shipping-quote/';

// ─── Thunks ───────────────────────────────────────────────────────────

export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiService.get(CART_URL);
      return res.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

export const addToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, variantId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const res = await apiService.post(CART_ITEMS_URL, {
        product_id: productId,
        variant_id: variantId,
        quantity,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const res = await apiService.patch(CART_ITEM_URL(itemId), { quantity });
      return res.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      await apiService.delete(CART_ITEM_URL(itemId));
      return itemId;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

export const applyVoucher = createAsyncThunk(
  'cart/applyVoucher',
  withValidation(
    async (code, { rejectWithValue }) => {
      try {
        const res = await apiService.post(CART_VOUCHER_URL, { code });
        return res.data;
      } catch (err) {
        return rejectWithValue(serializeApiError(err));
      }
    },
    CommonValidators.validateNonEmpty('voucher code'),
    { throwOnError: true, fnName: 'cart/applyVoucher' },
  ),
);

export const removeVoucher = createAsyncThunk(
  'cart/removeVoucher',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.delete(CART_VOUCHER_URL);
      return null;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

/** UC-CART-05 — guardar carrito para mas tarde (requiere auth). */
export const saveCartForLater = createAsyncThunk(
  'cart/saveForLater',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiService.post(CART_SAVE_URL, {});
      return res.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

/** UC-CART-06 — sincronizar (fusionar) carrito anonimo al autenticar. */
export const syncCartOnLogin = createAsyncThunk(
  'cart/sync',
  async (cartToken, { rejectWithValue }) => {
    try {
      const res = await apiService.post(CART_MERGE_URL, { cart_token: cartToken });
      return res.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

/**
 * UC-LOG-09 — Calcular Costo de Envio.
 *
 * Cotiza el envio para un codigo postal y subtotal dados. El backend
 * (mockeado en MSW) deriva zona, costo, ETA y si el pedido califica a
 * envio gratis por umbral. Feature FABRICADA del template.
 */
export const fetchShippingQuote = createAsyncThunk(
  'cart/fetchShippingQuote',
  async ({ postal_code, subtotal }, { rejectWithValue }) => {
    try {
      const res = await apiService.post(SHIPPING_QUOTE_URL, {
        postal_code,
        subtotal,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(serializeApiError(err));
    }
  },
);

// ─── Helpers ──────────────────────────────────────────────────────────

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

/**
 * Mapea el objeto `totals` del servidor (modelo tax-INCLUSIVO) al estado
 * del slice. El backend serializa los montos como strings decimales; se
 * normalizan con Number() para que los consumidores hagan aritmetica.
 *
 * Compat: `tax` es alias de `tax_included` (IVA informativo, ya incluido
 * en el precio — NO se suma al total). `total === subtotal_net`.
 *
 * Ya NO se recalcula en cliente: la fuente de verdad son los totales del
 * server. Esto corrige el drift tax-exclusivo (`total = subtotal + 16%`)
 * que sobre-cobraba IVA.
 */
const mapTotals = (totals) => {
  if (!totals) return { ...EMPTY_TOTALS };
  const num = (v) => (v == null ? null : Number(v));
  const taxIncluded = num(totals.tax_included) ?? 0;
  return {
    subtotal:                num(totals.subtotal) ?? 0,
    discount:                num(totals.discount) ?? 0,
    subtotal_net:            num(totals.subtotal_net) ?? 0,
    tax_included:            taxIncluded,
    // Alias de compatibilidad para consumidores legacy que leen `tax`.
    tax:                     taxIncluded,
    shipping_cost:           num(totals.shipping_cost),
    total:                   num(totals.total) ?? 0,
    free_shipping_threshold: num(totals.free_shipping_threshold),
    free_shipping_remaining: num(totals.free_shipping_remaining),
    free_shipping_applied:   !!totals.free_shipping_applied,
    item_count:              num(totals.item_count) ?? 0,
  };
};

/**
 * Reproyeccion local de totales con el modelo tax-INCLUSIVO, usada solo
 * cuando una mutacion devuelve un delta (no el Cart completo), p.ej.
 * `removeCartItem` que devuelve el itemId. Replica la formula del server:
 * `total = subtotal_net`, IVA ya incluido en `unit_price`.
 */
const IVA_RATE = 0.16;

const recomputeTotalsTaxInclusive = (items, voucher) => {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.unit_price ?? 0) * item.quantity,
    0,
  );
  const discount = voucher
    ? voucher.type === 'PERCENT'
      ? subtotal * (voucher.value / 100)
      : Math.min(voucher.value, subtotal)
    : 0;
  const subtotalNet = subtotal - discount;
  const taxIncluded = subtotalNet * (IVA_RATE / (1 + IVA_RATE));
  return {
    ...EMPTY_TOTALS,
    subtotal:     subtotal,
    discount:     discount,
    subtotal_net: subtotalNet,
    tax_included: taxIncluded,
    tax:          taxIncluded,
    total:        subtotalNet,
    item_count:   items.reduce((n, i) => n + i.quantity, 0),
  };
};

// ─── Slice ────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items:     [],
    voucher:   null,
    totals:    { ...EMPTY_TOTALS },
    itemCount:   0,
    isLoading:   false,
    error:       null,
    isActioning: false,
    actionError: null,
    lastAction:  null,
    // UC-LOG-09 — cotizacion de envio.
    shippingQuote: null,
    isQuoting:     false,
    quoteError:    null,
  },
  reducers: {
    clearCart(state) {
      state.items    = [];
      state.voucher  = null;
      state.totals   = { ...EMPTY_TOTALS };
      state.itemCount = 0;
    },
    clearCartActionState(state) {
      state.isActioning = false;
      state.actionError = null;
      state.lastAction  = null;
    },
    clearShippingQuote(state) {
      state.shippingQuote = null;
      state.quoteError    = null;
    },
  },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      const cart = action.payload ?? {};
      state.items    = cart.items ?? [];
      state.voucher  = cart.voucher ?? null;
      // Totales desde la respuesta del server (tax-inclusivo). NO se
      // recalculan en cliente.
      state.totals   = mapTotals(cart.totals);
      state.itemCount = cart.totals?.item_count != null
        ? Number(cart.totals.item_count)
        : state.items.reduce((n, i) => n + i.quantity, 0);
      state.isLoading = false;
      state.error    = null;
    };

    builder
      .addCase(fetchCart.pending,  (state) => { state.isLoading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected,  (state, a) => {
        state.isLoading = false;
        state.error = a.payload;
      });

    builder
      .addCase(addToCart.pending,  (state) => {
        state.isLoading   = true;
        state.isActioning = true;
        state.actionError = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        setCart(state, action);
        state.isActioning = false;
        state.lastAction  = 'added';
      })
      .addCase(addToCart.rejected,  (state, a) => {
        state.isLoading   = false;
        state.isActioning = false;
        state.actionError = a.payload;
        state.error       = a.payload;
      });

    builder
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeCartItem.fulfilled, (state, action) => {
        // El thunk DELETE devuelve solo el itemId. Se actualiza la lista
        // localmente y se reproyectan los totales con el modelo
        // tax-inclusivo del server hasta el proximo fetch.
        state.items     = state.items.filter((i) => i.id !== action.payload);
        state.totals    = recomputeTotalsTaxInclusive(state.items, state.voucher);
        state.itemCount = state.items.reduce((n, i) => n + i.quantity, 0);
      });

    builder
      .addCase(applyVoucher.fulfilled, setCart)
      .addCase(applyVoucher.rejected,  (state, a) => {
        state.actionError = a.payload;
      })
      .addCase(removeVoucher.fulfilled, setCart);

    builder
      .addCase(saveCartForLater.pending, (state) => {
        state.isActioning = true;
        state.actionError = null;
      })
      .addCase(saveCartForLater.fulfilled, (state) => {
        state.isActioning = false;
        state.lastAction  = 'saved';
      })
      .addCase(saveCartForLater.rejected, (state, a) => {
        state.isActioning = false;
        state.actionError = a.payload;
      });

    builder
      .addCase(syncCartOnLogin.pending, (state) => {
        state.isActioning = true;
        state.actionError = null;
      })
      .addCase(syncCartOnLogin.fulfilled, (state, action) => {
        setCart(state, action);
        state.isActioning = false;
        state.lastAction  = 'synced';
      })
      .addCase(syncCartOnLogin.rejected, (state, a) => {
        state.isActioning = false;
        state.actionError = a.payload;
      });

    builder
      .addCase(fetchShippingQuote.pending, (state) => {
        state.isQuoting  = true;
        state.quoteError = null;
      })
      .addCase(fetchShippingQuote.fulfilled, (state, action) => {
        state.isQuoting     = false;
        state.shippingQuote = action.payload;
        state.quoteError    = null;
      })
      .addCase(fetchShippingQuote.rejected, (state, a) => {
        state.isQuoting     = false;
        state.shippingQuote = null;
        state.quoteError    = a.payload;
      });
  },
});

export const { clearCart, clearCartActionState, clearShippingQuote } =
  cartSlice.actions;
export default cartSlice.reducer;

// addCartItem: alias de addToCart para compatibilidad con el sistema de
// diseno Yoruba. El paquete importa addCartItem; nuestro slice usa addToCart.
// Agregado en F4 de adaptar-sistema-diseno-yoruba (H-F4-01).
export const addCartItem = addToCart;
