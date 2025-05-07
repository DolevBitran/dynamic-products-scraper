import type { RootState } from '@store/index';

// Auth selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;

// Combined selectors
export const selectAuthState = (state: RootState) => ({
  user: state.auth.user,
  token: state.auth.token,
  isLoading: state.auth.isLoading,
  error: state.auth.error,
  isAuthenticated: !!state.auth.token,
});
