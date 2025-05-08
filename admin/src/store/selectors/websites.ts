import type { RootState } from '@store/index';

export const selectWebsites = (state: RootState) => state.websites.websites;
export const selectWebsitesLoading = (state: RootState) => state.websites.isLoading;
export const selectWebsitesError = (state: RootState) => state.websites.error;

export const selectWebsitesState = (state: RootState) => ({
  websites: state.websites.websites,
  isLoading: state.websites.isLoading,
  error: state.websites.error,
});
