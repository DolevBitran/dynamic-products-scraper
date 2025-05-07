// Import the models
import { fields } from './fields';
import { products } from './products';
import { ui } from './ui';
import { auth } from './auth';
import { RootModel } from './types';

// Export the models object
export const models: RootModel = {
  fields,
  products,
  ui,
  auth,
};
