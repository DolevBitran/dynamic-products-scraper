import { RootState } from '../index';

// Get active tab
export const selectActiveTab = (state: RootState): string => 
  state.ui.activeTab;

// Select loading state
export const selectUILoading = (state: RootState): boolean => 
  state.ui.isLoading;

// Select initialization state
export const selectIsInitialized = (state: RootState): boolean => 
  state.ui.isInitialized;

// Select error state
export const selectUIError = (state: RootState): string | null => 
  state.ui.error;

// Select any error across all models
export const selectAnyError = (state: RootState): string | null => 
  state.ui.error || state.fields.error || state.products.error;

// Select any loading state across all models
export const selectAnyLoading = (state: RootState): boolean => 
  state.ui.isLoading || state.fields.isLoading || state.products.isLoading;
