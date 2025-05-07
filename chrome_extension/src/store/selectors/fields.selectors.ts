import { RootState } from '../index';
import { ScrapeType } from '@utils/types';

// Get all fields
export const selectAllFields = (state: RootState): Field[] => 
  state.fields.fieldsData;

// Get fields by scrape type
export const selectCategoryFields = (state: RootState): Field[] => 
  state.fields.fieldsData.filter((field: Field) => field.scrapeType === ScrapeType.CATEGORY);

// Get fields by product scrape type
export const selectProductFields = (state: RootState): Field[] => 
  state.fields.fieldsData.filter((field: Field) => field.scrapeType === ScrapeType.PRODUCT);

// Select loading state
export const selectFieldsLoading = (state: RootState): boolean => 
  state.fields.isLoading;

// Select error state
export const selectFieldsError = (state: RootState): string | null => 
  state.fields.error;
