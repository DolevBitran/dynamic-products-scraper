import type { RootState } from '@store/index';

// Users selectors
export const selectUsers = (state: RootState) => state.users.users;
export const selectIsLoading = (state: RootState) => state.users.isLoading;
export const selectError = (state: RootState) => state.users.error;

// Combined selector
export const selectUsersState = (state: RootState) => ({
  users: state.users.users,
  isLoading: state.users.isLoading,
  error: state.users.error
});
