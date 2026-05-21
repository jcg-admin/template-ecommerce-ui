/**
 * Factories MSW para datos mock realistas.
 *
 * Cada factory genera una entidad del dominio con campos coherentes
 * usando @faker-js/faker. Los handlers usan estas factories para
 * listados con variabilidad; los detalles usan datos determinisitcos
 * (overrides) para que los tests no fluctuen.
 *
 * Patron:
 *   createX(overrides?: Partial<X>): X
 *   createXList(count: number, overrides?: Partial<X>): X[]
 *
 * Determinismo en tests: llamar `faker.seed(N)` desde un `beforeEach`.
 */

export { createProduct, createProductList } from './product';
export { createUser } from './user';
export { createCartItem, createCartItemList } from './cart';
export { createOrder, createOrderList } from './order';
export { createVoucher } from './voucher';
