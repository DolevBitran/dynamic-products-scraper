import type { Models } from '@rematch/core';
import { auth } from '@store/models/auth';
import { fields } from '@store/models/fields';
import { products } from '@store/models/products';
import { users } from '@store/models/users';

export interface RootModel extends Models<RootModel> {
  auth: typeof auth;
  fields: typeof fields;
  products: typeof products;
  users: typeof users;
}
