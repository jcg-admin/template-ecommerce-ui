/**
 * Tipos comunes a los handlers MSW.
 *
 * Re-exporta los tipos del dominio para que cada archivo de handler
 * importe desde un solo lugar y para que el dia que `domain.ts`
 * mueva campos, los handlers sepan compilar contra la nueva forma.
 */

export type {
  User,
  Category,
  Product,
  CartItem,
  Voucher,
  VoucherType,
  Order,
  OrderStatus,
  Toast,
  ToastKind,
  PaginatedResponse,
  SerializedApiError,
} from '../../types/domain';
