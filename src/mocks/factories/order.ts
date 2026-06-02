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

const STAGE_NAMES = ['Pedido confirmado', 'En preparacion', 'Enviado', 'En reparto', 'Entregado'];

/** Genera etapas de fulfillment datadas a partir de la fecha de creacion. */
function buildStages(createdAtISO: string) {
  const start = new Date(createdAtISO).getTime();
  const DAY = 86_400_000;
  return STAGE_NAMES.map((name, i) => ({
    id: `stage-${i}`,
    name,
    start: new Date(start + i * DAY).toISOString(),
    end: new Date(start + (i + 1) * DAY).toISOString(),
    progress: i < 3 ? 100 : i === 3 ? 50 : 0,
  }));
}

export function createOrder(overrides: Partial<Order> = {}): Order {
  const status = overrides.status ?? faker.helpers.arrayElement(STATUSES);
  const subtotal = overrides.subtotal ?? faker.number.int({ min: 200, max: 5000 });
  const tax = overrides.tax ?? Math.round(subtotal * 0.16);
  const discount = overrides.discount ?? 0;
  const total = overrides.total ?? subtotal + tax - discount;
  const createdAt = overrides.created_at ?? faker.date.recent({ days: 60 }).toISOString();
  return {
    order_number: overrides.order_number ?? `ORD-${faker.number.int({ min: 1000, max: 9999 })}`,
    status,
    status_display: overrides.status_display ?? status,
    total,
    subtotal,
    tax,
    discount,
    created_at: createdAt,
    items: overrides.items ?? [createCartItem()],
    invoice_url: overrides.invoice_url ?? '/mock/factura-demo.pdf',
    fulfillment_stages: overrides.fulfillment_stages ?? buildStages(createdAt),
  };
}

export function createOrderList(count: number, overrides: Partial<Order> = {}): Order[] {
  return Array.from({ length: count }, () => createOrder(overrides));
}
