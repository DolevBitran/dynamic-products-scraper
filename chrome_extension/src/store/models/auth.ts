import { createModel } from '@rematch/core';
import type { RootModel } from './types';
import api from '@service/api';

export interface Website {
  id: string;
  name: string;
  url: string;
  status: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
  websites?: Website[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

// Initialize with empty state, we'll load from Chrome storage
const initialState: AuthState = {
  user: null,
  token: null, // We'll load this asynchronously
  refreshToken: null, // We'll load this asynchronously
  isLoading: true, // Start with loading true until we check storage
  error: null,
};

export const auth = createModel<RootModel>()({
  state: initialState,
  reducers: {
    setUser(state, user: User | null) {
      // Also save user to Chrome storage if it exists
      if (user) {
        chrome.storage.local.set({ user: JSON.stringify(user) });
      }
      return { ...state, user, error: null };
    },
    setToken(state, token: string | null) {
      if (token) {
        chrome.storage.local.set({ accessToken: token });
      }
      return {
        ...state,
        token
      };
    },

    setRefreshToken(state, refreshToken: string | null) {
      if (refreshToken) {
        chrome.storage.local.set({ refreshToken });
      }
      return {
        ...state,
        refreshToken
      };
    },
    setLoading(state, isLoading: boolean) {
      return { ...state, isLoading };
    },
    setError(state, error: string | null) {
      return { ...state, error };
    },
    logout(state) {
      // Remove auth data from Chrome storage
      chrome.storage.local.remove(['accessToken', 'refreshToken', 'user']);
      return { ...state, user: null, token: null, refreshToken: null, error: null };
    },
  },
  effects: (dispatch) => ({
    async login(credentials: LoginCredentials) {
      try {
        dispatch.auth.setLoading(true);
        dispatch.auth.setError(null);

        const { data } = await api.post('/auth/login', credentials);

        if (data.success) {
          dispatch.auth.setUser(data.user);
          dispatch.auth.setToken(data.accessToken);
          dispatch.auth.setRefreshToken(data.refreshToken);
          return { success: true };
        } else {
          dispatch.auth.setError(data.message || 'Login failed');
          return { success: false, error: data.message };
        }
      } catch (error: any) {
        console.error('Login error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Login failed';
        dispatch.auth.setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        dispatch.auth.setLoading(false);
      }
    },

    async fetchCurrentUser() {
      try {
        dispatch.auth.setLoading(true);

        // Load tokens from Chrome storage
        chrome.storage.local.get(['accessToken', 'refreshToken'], async (result) => {
          const { accessToken, refreshToken } = result;

          if (!accessToken) {
            // No token in storage, user is not logged in
            dispatch.auth.setLoading(false);
            return;
          }

          dispatch.auth.setToken(accessToken);
          dispatch.auth.setRefreshToken(refreshToken);

          // Always fetch the latest user data from the server
          // This ensures any changes made through the admin panel (like adding websites)
          // are reflected in the Chrome extension
          try {
            const { data } = await api.get('/auth/me');

            if (data.success) {
              console.log('Fetched updated user data:', data.user);
              // Update user data from server
              dispatch.auth.setUser(data.user);
            } else {
              // If token is invalid, logout
              dispatch.auth.logout();
            }
          } catch (error) {
            console.error('Error fetching current user from server:', error);
            dispatch.auth.logout();
          } finally {
            dispatch.auth.setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error in fetchCurrentUser:', error);
        dispatch.auth.setLoading(false);
        dispatch.auth.logout();
      }
    },

    async logoutUser() {
      try {
        await api.post('/auth/logout');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        dispatch.auth.logout();
      }
    },
  }),
});
