/**
 * PropShapes -- e-comerce-ui
 *
 * Definiciones centralizadas de tipos del dominio del e-commerce, en
 * dos formas que conviven sin duplicar la verdad:
 *
 *   - Una `interface` o `type` TypeScript por dominio. Estos tipos son
 *     la fuente del autocompletado en editores y del chequeo estatico
 *     cuando el consumidor es un archivo `.ts` o `.tsx`.
 *
 *   - Un `PropTypes.shape({...})` exportado con el sufijo `Shape` para
 *     que componentes `.jsx` que aun no migran a TypeScript puedan
 *     declarar `Componente.propTypes = { user: UserShape }` y obtener
 *     validacion en runtime durante desarrollo.
 *
 * Mantener ambos en este archivo es deliberado: una sola edicion al
 * agregar un campo nuevo cubre el contrato en compilacion y en runtime.
 *
 * Migracion: T-008 de la iniciativa
 * `resolver-hallazgos-de-deuda-del-template`.
 */

import PropTypes from 'prop-types';

// ──────────────────────────────────────────────────────────────────────
// Usuario

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
}

export const UserShape = PropTypes.shape({
  id:         PropTypes.number.isRequired,
  email:      PropTypes.string.isRequired,
  first_name: PropTypes.string,
  last_name:  PropTypes.string,
  is_staff:   PropTypes.bool,
});

// ──────────────────────────────────────────────────────────────────────
// Categoria

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export const CategoryShape = PropTypes.shape({
  id:   PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
});

// ──────────────────────────────────────────────────────────────────────
// Producto y su imagen

export interface ProductImage {
  id?: number;
  url?: string;
  is_main?: boolean;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  original_price?: number;
  stock: number;
  category?: Category;
  images?: ProductImage[];
  rating_avg?: number;
  review_count?: number;
}

export const ProductShape = PropTypes.shape({
  id:             PropTypes.number.isRequired,
  slug:           PropTypes.string.isRequired,
  name:           PropTypes.string.isRequired,
  price:          PropTypes.number.isRequired,
  original_price: PropTypes.number,
  stock:          PropTypes.number.isRequired,
  category:       CategoryShape,
  images:         PropTypes.arrayOf(PropTypes.shape({
    id:      PropTypes.number,
    url:     PropTypes.string,
    is_main: PropTypes.bool,
  })),
  rating_avg:    PropTypes.number,
  review_count:  PropTypes.number,
});

// ──────────────────────────────────────────────────────────────────────
// Item del carrito

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export const CartItemShape = PropTypes.shape({
  id:         PropTypes.number.isRequired,
  product_id: PropTypes.number.isRequired,
  name:       PropTypes.string.isRequired,
  price:      PropTypes.number.isRequired,
  quantity:   PropTypes.number.isRequired,
  image:      PropTypes.string,
});

// ──────────────────────────────────────────────────────────────────────
// Voucher

export type VoucherType = 'PERCENT' | 'FIXED';

export interface Voucher {
  code: string;
  type: VoucherType;
  value: number;
}

export const VoucherShape = PropTypes.shape({
  code:  PropTypes.string.isRequired,
  type:  PropTypes.oneOf<VoucherType>(['PERCENT', 'FIXED']).isRequired,
  value: PropTypes.number.isRequired,
});

// ──────────────────────────────────────────────────────────────────────
// Orden

export interface Order {
  id: number;
  status: string;
  total: number;
  created_at: string;
  items?: unknown[];
}

export const OrderShape = PropTypes.shape({
  id:         PropTypes.number.isRequired,
  status:     PropTypes.string.isRequired,
  total:      PropTypes.number.isRequired,
  created_at: PropTypes.string.isRequired,
  items:      PropTypes.array,
});

// ──────────────────────────────────────────────────────────────────────
// Direccion

export interface Address {
  first_name?: string;
  last_name?: string;
  street?: string;
  number?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export const AddressShape = PropTypes.shape({
  first_name:  PropTypes.string,
  last_name:   PropTypes.string,
  street:      PropTypes.string,
  number:      PropTypes.string,
  city:        PropTypes.string,
  state:       PropTypes.string,
  postal_code: PropTypes.string,
  country:     PropTypes.string,
});

// ──────────────────────────────────────────────────────────────────────
// Toast

export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastKind;
  title?: string;
  message?: string;
}

export const ToastShape = PropTypes.shape({
  id:      PropTypes.number.isRequired,
  type:    PropTypes.oneOf<ToastKind>(['success', 'error', 'warning', 'info']).isRequired,
  title:   PropTypes.string,
  message: PropTypes.string,
});
