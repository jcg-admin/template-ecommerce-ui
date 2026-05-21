/**
 * Factory de Order.
 */

import { faker } from '@faker-js/faker';
import type { Order, OrderStatus } from '../handlers/types';
import { createCartItem } from './cart';

const STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

export function createOrder(overrides: Partial<Order> = {}): Order {
  const status = overrides.status ?? faker.helpers.arrayElement(STATUSES);
  const subtotal = overrides.subtotal ?? faker.number.int({ min: 200, max: 5000 });
  const tax = overrides.tax ?? Math.round(subtotal * 0.16);
  const discount = overrides.discount ?? 0;
  const total = overrides.total ?? subtotal + tax - discount;
  return {
    order_number: overrides.order_number ?? `ORD-${faker.number.int({ min: 1000, max: 9999 })}`,
    status,
    status_display: overrides.status_display ?? status,
    total,
    subtotal,
    tax,
    discount,
    created_at: overrides.created_at ?? faker.date.recent({ days: 60 }).toISOString(),
    items: overrides.items ?? [createCartItem()],
  };
}

export function createOrderList(count: number, overrides: Partial<Order> = {}): Order[] {
  return Array.from({ length: count }, () => createOrder(overrides));
}
