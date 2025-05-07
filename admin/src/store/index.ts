import { init } from '@rematch/core';
import type { RematchDispatch, RematchRootState } from '@rematch/core';
import type { RootModel } from '@store/models';
import { auth } from '@store/models/auth';
import { fields } from '@store/models/fields';
import { products } from '@store/models/products';
import { users } from '@store/models/users';

const models: RootModel = { auth, fields, products, users };

export const store = init({
  models,
});

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;
