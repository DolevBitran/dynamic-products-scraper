import { createModel } from '@rematch/core';
import type { RootModel } from '.';
import api from '@service/api';

export interface User {
  id: string; // Object ID from the backend
  userId?: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
  websites?: Website[]; // Array of website IDs
}

export interface Website {
  id: string;
  name: string;
  url: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

// Extended interface for creating users that includes password
export interface CreateUserData {
  name?: string;
  email: string;
  password: string;
  role?: string;
}

export interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  isLoading: false,
  error: null,
};

export const users = createModel<RootModel>()({
  state: initialState,
  reducers: {
    setUsers(state, users: User[]) {
      return { ...state, users, isLoading: false, error: null };
    },
    setLoading(state, isLoading: boolean) {
      return { ...state, isLoading };
    },
    setError(state, error: string) {
      return { ...state, error, isLoading: false };
    },
    addUser(state, user: User) {
      return { ...state, users: [...state.users, user] };
    },
    setUser(state, updatedUser: User) {
      return {
        ...state,
        users: state.users.map(user =>
          user.id === updatedUser.id ? updatedUser : user
        ),
      };
    },
    removeUser(state, userId: string) {
      return {
        ...state,
        users: state.users.filter(user => user.id !== userId),
      };
    },
  },
  effects: (dispatch) => ({
    async fetchUsers() {
      try {
        dispatch.users.setLoading(true);
        const response = await api.get('/users');

        if (response.data.success) {
          dispatch.users.setUsers(response.data.users);
        } else {
          dispatch.users.setError(response.data.message || 'Failed to fetch users');
        }
      } catch (error: any) {
        console.error('Error fetching users:', error);
        dispatch.users.setError(error.message || 'Failed to fetch users');
      }
    },

    async createUser(userData: CreateUserData) {
      try {
        dispatch.users.setLoading(true);
        const response = await api.post('/auth/register', userData);
        console.log({ newUser: response.data.user })
        if (response.data.success) {
          dispatch.users.setUser(response.data.user);
          return { success: true, user: response.data.user };
        } else {
          dispatch.users.setError(response.data.message || 'Failed to create user');
          return { success: false, error: response.data.message };
        }
      } catch (error: any) {
        console.error('Error creating user:', error);

        // Extract the actual error message from the response if available
        let errorMessage = 'Failed to create user';

        if (error.response && error.response.data) {
          // Use the server's error message if available
          errorMessage = error.response.data.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        dispatch.users.setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },

    async updateUser(userData: User) {
      try {
        dispatch.users.setLoading(true);
        const response = await api.put(`/users/${userData.id}`, { ...userData, websites: userData.websites?.map((website: Website) => website.id.toString()) });

        if (response.data.success) {
          dispatch.users.setUser(response.data.user);
          return { success: true, user: response.data.user };
        } else {
          dispatch.users.setError(response.data.message || 'Failed to update user');
          return { success: false, error: response.data.message };
        }
      } catch (error: any) {
        console.error('Error updating user:', error);
        dispatch.users.setError(error.message || 'Failed to update user');
        return { success: false, error: error.message };
      }
    },

    async deleteUser(userId: string) {
      try {
        dispatch.users.setLoading(true);
        const response = await api.delete(`/users/${userId}`);

        if (response.data.success) {
          dispatch.users.removeUser(userId);
          return { success: true };
        } else {
          dispatch.users.setError(response.data.message || 'Failed to delete user');
          return { success: false, error: response.data.message };
        }
      } catch (error: any) {
        console.error('Error deleting user:', error);
        dispatch.users.setError(error.message || 'Failed to delete user');
        return { success: false, error: error.message };
      }
    },
  }),
});
