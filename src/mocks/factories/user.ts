/**
 * Factory de User.
 */

import { faker } from '@faker-js/faker';
import type { User } from '../handlers/types';

export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: overrides.id ?? faker.number.int({ min: 1, max: 9999 }),
    email: overrides.email ?? faker.internet.email(),
    first_name: overrides.first_name ?? faker.person.firstName(),
    last_name: overrides.last_name ?? faker.person.lastName(),
    phone: overrides.phone ?? faker.phone.number(),
    avatar_url: overrides.avatar_url,
    is_staff: overrides.is_staff ?? false,
    profile_completeness: overrides.profile_completeness ?? faker.number.int({ min: 30, max: 100 }),
    pending_fields: overrides.pending_fields ?? [],
  };
}
