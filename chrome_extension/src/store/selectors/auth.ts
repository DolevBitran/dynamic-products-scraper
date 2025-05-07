import { RootState } from '@store/index';

// Select the entire auth state
export const selectAuthState = (state: RootState) => state.auth;

// Select user from auth state
export const selectUser = (state: RootState) => state.auth.user;

// Select token from auth state
export const selectToken = (state: RootState) => state.auth.token;

// Select loading state
export const selectIsLoading = (state: RootState) => state.auth.isLoading;

// Select error state
export const selectError = (state: RootState) => state.auth.error;

// Select authentication status
export const selectIsAuthenticated = (state: RootState) => 
  Boolean(state.auth.token && state.auth.user);
