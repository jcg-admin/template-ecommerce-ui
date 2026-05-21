/**
 * Factory de CartItem.
 */

import { faker } from '@faker-js/faker';
import type { CartItem } from '../handlers/types';

export function createCartItem(overrides: Partial<CartItem> = {}): CartItem {
  const id = overrides.id ?? faker.number.int({ min: 1, max: 9999 });
  const price = overrides.price ?? faker.number.int({ min: 100, max: 2500 });
  return {
    id,
    product_id: overrides.product_id ?? faker.number.int({ min: 1, max: 100 }),
    variant_id: overrides.variant_id ?? 1,
    name: overrides.name ?? faker.commerce.productName(),
    price,
    quantity: overrides.quantity ?? faker.number.int({ min: 1, max: 5 }),
    image: overrides.image ?? '/mock-images/product.jpg',
  };
}

export function createCartItemList(count: number, overrides: Partial<CartItem> = {}): CartItem[] {
  return Array.from({ length: count }, () => createCartItem(overrides));
}
