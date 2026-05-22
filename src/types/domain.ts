/**
 * Tipos del dominio del e-commerce -- ecommerce-ui
 *
 * Modulo unico de tipos para las entidades del dominio que el template
 * implementa. Cada tipo lleva una nota indicando si esta **completo**
 * (refleja lo que cualquier e-commerce necesita) o **parcial** (campos
 * suficientes para lo que el template hace hoy, pero el dominio comun
 * pide mas).
 *
 * La extension de los tipos parciales (User completo con verificacion
 * y roles granulares, `Address` como entidad reutilizable,
 * `ProductVariant` como entidad propia con sku y stock por variante,
 * `Review`) pertenece a la iniciativa registrada en backlog
 * `completar-dominio-de-ecommerce`, no a este modulo. Aqui se documenta
 * el gap; alli se llena.
 *
 * Migracion: T-015 (replanificada) de la iniciativa
 * `resolver-hallazgos-de-deuda-del-template`. Sustituye al modulo
 * previo basado en validacion runtime que reflejaba un dominio
 * teorico que el template no implementa.
 */

// Re-export del tipo del error serializado para que los consumidores
// tengan un unico punto de entrada al dominio.
export type { SerializedApiError } from '@utils/serializeApiError';

// ──────────────────────────────────────────────────────────────────────
// Usuario
//
// Estado: parcial. El template guarda lo que ve un comprador autenticado
// estandar mas la marca `is_staff` de DRF. Falta el dominio comun de
// verificacion (email confirmado, telefono confirmado), roles granulares
// mas alla de staff/no-staff, sesiones activas y politicas de bloqueo.
//
// Ver iniciativa `completar-dominio-de-ecommerce` para la extension.

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  is_staff?: boolean;
  /** Porcentaje 0..100 de completitud del perfil. */
  profile_completeness?: number;
  /** Lista de campos del perfil que faltan por completar. */
  pending_fields?: string[];
}

// ──────────────────────────────────────────────────────────────────────
// Categoria
//
// Estado: completo para el modelo plano del template. Cualquier
// e-commerce puede ampliar a categorias jerarquicas con `parent_id`,
// pero la version plana cubre el caso comun.

export interface Category {
  id: number;
  name: string;
  slug: string;
  /** Numero de productos publicados en la categoria. */
  product_count?: number;
}

// ──────────────────────────────────────────────────────────────────────
// Producto
//
// Estado: completo para el modelo sin variantes. El template usa precio
// dual (base sin IVA + con IVA), categoria desnormalizada como
// `category_name`, y campos de presentacion (`is_featured`,
// `highlighted_name`).
//
// Lo que falta y vive en `completar-dominio-de-ecommerce`:
// `ProductVariant` como entidad propia con su sku, stock y precio,
// y `Review` agregada como entidad.

export interface Product {
  id?: number;
  slug: string;
  sku?: string;
  name: string;
  /** Nombre con marcas HTML de resaltado tras una busqueda. */
  highlighted_name?: string;
  description?: string;
  /** Precio base sin impuestos en la moneda del template. */
  base_price: number;
  /** Precio final mostrado al comprador, con impuestos aplicados. */
  price_with_tax: number;
  /** Precio efectivo cuando hay descuentos o variantes; suele igualar a `price_with_tax`. */
  effective_price?: number;
  stock: number;
  /** Nombre de categoria desnormalizado (DRF lo provee asi para listados). */
  category_name?: string;
  /** Categoria completa si el endpoint la incluye. */
  category?: Category;
  is_featured?: boolean;
  /** Resumen agregado de calificaciones. Reviews como entidad se delega. */
  rating_avg?: number;
  review_count?: number;
}

// ──────────────────────────────────────────────────────────────────────
// CartItem
//
// Estado: parcial. Cubre lo que el template usa para calcular totales
// y renderizar el carrito. El dominio comun incluye `variant_id` y el
// precio congelado al momento de anadir (para resistir cambios de
// precio mientras el carrito esta abierto).
//
// Ver iniciativa `completar-dominio-de-ecommerce` para la extension
// hacia variantes.

export interface CartItem {
  id: number;
  product_id?: number;
  variant_id?: number;
  name: string;
  /** Precio unitario al momento de anadir (no se recalcula en cliente). */
  price: number;
  quantity: number;
  image?: string;
}

// ──────────────────────────────────────────────────────────────────────
// Voucher
//
// Estado: completo para el modelo binario porcentaje/fijo. Otros tipos
// (envio gratis, regalo, segunda unidad) son extensiones especificas
// del adoptante.

export type VoucherType = 'PERCENT' | 'FIXED';

export interface Voucher {
  code: string;
  type: VoucherType;
  /** Porcentaje 0..100 si `type='PERCENT'`, monto absoluto si `type='FIXED'`. */
  value: number;
}

// ──────────────────────────────────────────────────────────────────────
// Orden
//
// Estado: parcial. Cubre la cabecera (numero, estado, total, fecha)
// que el template renderiza en `OrdersPage` y `OrderDetailPage`. Los
// items de la orden son del mismo tipo `CartItem` con su precio
// congelado, no se redefinen.
//
// Falta lo que pertenece a `completar-dominio-de-ecommerce`:
// direccion de envio congelada, totales detallados desglosados,
// shipment con tracking, lista de pagos asociados.

/**
 * Estado de la orden segun el dominio del template. Cualquier
 * adoptante puede extenderlo, pero estos son los valores que las
 * pantallas existentes reconocen.
 */
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Order {
  /** Identificador human-readable que el adoptante usa en URLs y referencias. */
  order_number: string;
  status: OrderStatus;
  /** Etiqueta amistosa lista para mostrar; DRF la provee desnormalizada. */
  status_display?: string;
  /** Total final con impuestos, descuentos y envio aplicados. */
  total: number;
  /** Subtotal antes de impuestos y descuento. */
  subtotal?: number;
  tax?: number;
  discount?: number;
  /** ISO-8601. */
  created_at: string;
  items?: CartItem[];
}

// ──────────────────────────────────────────────────────────────────────
// Toast
//
// Estado: completo para el patron de notificaciones UI estandar.

export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastKind;
  title?: string;
  message?: string;
  /** Duracion en milisegundos antes del auto-dismiss. */
  duration?: number;
}

// ──────────────────────────────────────────────────────────────────────
// Respuesta paginada
//
// Estado: completo. Replica el contrato de paginacion de Django REST
// Framework, que es el backend de referencia del template. Adoptantes
// con otro backend pueden alias-ar este tipo o redefinirlo.

export interface PaginatedResponse<T> {
  count: number;
  results: T[];
  next?: string | null;
  previous?: string | null;
}
