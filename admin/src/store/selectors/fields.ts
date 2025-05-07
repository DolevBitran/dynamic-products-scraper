import type { RootState } from '@store/index';

// Fields selectors
export const selectFields = (state: RootState) => state.fields.fields;
export const selectFieldsLoading = (state: RootState) => state.fields.isLoading;
export const selectFieldsError = (state: RootState) => state.fields.error;

// Get a specific field by ID
export const selectFieldById = (id: string) => (state: RootState) => 
  state.fields.fields.find(field => field.id === id);

// Combined selectors
export const selectFieldsState = (state: RootState) => ({
  fields: state.fields.fields,
  isLoading: state.fields.isLoading,
  error: state.fields.error,
});
