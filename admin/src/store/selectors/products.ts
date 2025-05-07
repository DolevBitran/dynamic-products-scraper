import type { RootState } from '@store/index';

// Products selectors
export const selectProducts = (state: RootState) => state.products.products;
export const selectProductsLoading = (state: RootState) => state.products.isLoading;
export const selectProductsError = (state: RootState) => state.products.error;

// Get a specific product by ID
export const selectProductById = (id: string) => (state: RootState) => 
  state.products.products.find(product => product.id === id);

// Combined selectors
export const selectProductsState = (state: RootState) => ({
  products: state.products.products,
  isLoading: state.products.isLoading,
  error: state.products.error,
});
