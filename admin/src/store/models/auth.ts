import { createModel } from '@rematch/core';
import type { RootModel } from '@store/models';
import API from '@service/api';
import type { AuthState, LoginCredentials, RegisterCredentials } from '@utils/types';

export const auth = createModel<RootModel>()({
  state: {
    user: null,
    token: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isLoading: false,
    error: null,
  } as AuthState,

  reducers: {
    setUser(state, payload: AuthState['user']) {
      return {
        ...state,
        user: payload,
        isLoading: false,
        error: null,
      };
    },
    setToken(state, token: string | null) {
      if (token) {
        localStorage.setItem('accessToken', token);
      }
      return {
        ...state,
        token,
        isLoading: false,
        error: null,
      };
    },
    
    setRefreshToken(state, refreshToken: string | null) {
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      return {
        ...state,
        refreshToken,
        isLoading: false,
        error: null,
      };
    },
    setLoading(state, payload: boolean) {
      return {
        ...state,
        isLoading: payload,
      };
    },
    setError(state, payload: string) {
      return {
        ...state,
        error: payload,
        isLoading: false,
      };
    },
    clearAuth(state) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return {
        ...state,
        user: null,
        token: null,
        error: null,
      };
    },
    logout(state) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        error: null,
      };
    },
  },

  effects: (dispatch) => ({
    async login(credentials: LoginCredentials) {
      dispatch.auth.setLoading(true);
      try {
        const { data } = await API.post('/auth/login', credentials);
        dispatch.auth.setToken(data.accessToken);
        dispatch.auth.setRefreshToken(data.refreshToken);
        dispatch.auth.setUser(data.user);
        return data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Login failed';
        dispatch.auth.setError(errorMessage);
        return null;
      }
    },

    async register(credentials: RegisterCredentials) {
      dispatch.auth.setLoading(true);
      try {
        const { data } = await API.post('/auth/register', credentials);
        dispatch.auth.setToken(data.accessToken);
        dispatch.auth.setRefreshToken(data.refreshToken);
        dispatch.auth.setUser(data.user);
        return data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Registration failed';
        dispatch.auth.setError(errorMessage);
        return null;
      }
    },

    async fetchCurrentUser() {
      if (!localStorage.getItem('accessToken')) return null;

      dispatch.auth.setLoading(true);
      try {
        const { data } = await API.get('/auth/me');
        dispatch.auth.setUser(data.user);
        return data.user;
      } catch (error: any) {
        if (error.response?.status === 401) {
          dispatch.auth.clearAuth();
        }
        const errorMessage = error.response?.data?.message || 'Failed to fetch user';
        dispatch.auth.setError(errorMessage);
        return null;
      }
    },

    async logout() {
      dispatch.auth.clearAuth();
      // You can also call an API endpoint to invalidate the token on the server
      // await API.post('/auth/logout');
    },
  }),
});
