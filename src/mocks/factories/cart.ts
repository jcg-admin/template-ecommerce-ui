/**
 * Factory de CartItem.
 *
 * Genera items con el contrato real del backend (apps/cart serializers):
 * `product_name`, `unit_price` (string decimal) y `subtotal`. El modelo
 * es tax-inclusivo (el IVA ya esta en `unit_price`). `image_url` es una
 * extension documentada del template (miniatura), no esta en el backend.
 */

import { faker } from '@faker-js/faker';
import type { CartItem } from '../handlers/types';

export function createCartItem(overrides: Partial<CartItem> = {}): CartItem {
  const id = overrides.id ?? faker.number.int({ min: 1, max: 9999 });
  const quantity = overrides.quantity ?? faker.number.int({ min: 1, max: 5 });
  const unitPrice =
    overrides.unit_price ?? faker.number.int({ min: 100, max: 2500 }).toFixed(2);
  const subtotal =
    overrides.subtotal ?? (Number(unitPrice) * quantity).toFixed(2);
  return {
    id,
    product_id: overrides.product_id ?? faker.number.int({ min: 1, max: 100 }),
    variant_id: overrides.variant_id ?? 1,
    product_name: overrides.product_name ?? faker.commerce.productName(),
    product_slug: overrides.product_slug ?? faker.helpers.slugify(faker.commerce.productName()).toLowerCase(),
    sku: overrides.sku ?? faker.string.alphanumeric(8).toUpperCase(),
    unit_price: unitPrice,
    subtotal,
    quantity,
    available_stock: overrides.available_stock ?? faker.number.int({ min: 0, max: 99 }),
    is_available: overrides.is_available ?? true,
    price_changed: overrides.price_changed ?? false,
    // Extension del template (no esta en el backend real): miniatura.
    image_url: overrides.image_url ?? '/mock-images/product.jpg',
  };
}

export function createCartItemList(count: number, overrides: Partial<CartItem> = {}): CartItem[] {
  return Array.from({ length: count }, () => createCartItem(overrides));
}
