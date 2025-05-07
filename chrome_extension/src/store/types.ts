import { FieldsState } from './models/fields';
import { ProductsState } from './models/products';
import { UIState } from './models/ui';

/**
 * Interface for the root state of the application
 * This provides proper typing for accessing the rootState in effects
 */
export interface IRootState {
  fields: FieldsState;
  products: ProductsState;
  ui: UIState;
}
