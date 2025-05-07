import { RootState } from '../index';

// Get all scraped products
export const selectScrapedData = (state: RootState): Product[] => 
  state.products.scrapedData;

// Select loading state
export const selectProductsLoading = (state: RootState): boolean => 
  state.products.isLoading;

// Select error state
export const selectProductsError = (state: RootState): string | null => 
  state.products.error;

// Get product count
export const selectProductCount = (state: RootState): number => 
  state.products.scrapedData.length;
