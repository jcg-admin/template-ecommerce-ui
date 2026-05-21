/**
 * Factory de Voucher.
 */

import { faker } from '@faker-js/faker';
import type { Voucher, VoucherType } from '../handlers/types';

const TYPES: VoucherType[] = ['PERCENT', 'FIXED'];

export function createVoucher(overrides: Partial<Voucher> = {}): Voucher {
  const type = overrides.type ?? faker.helpers.arrayElement(TYPES);
  return {
    code: overrides.code ?? faker.string.alphanumeric({ length: 8, casing: 'upper' }),
    type,
    value: overrides.value ?? (type === 'PERCENT'
      ? faker.number.int({ min: 5, max: 50 })
      : faker.number.int({ min: 50, max: 500 })),
  };
}
