import { createModel } from '@rematch/core';
import type { RootModel } from '.';
import apiService from '@service/api';

export const WebsiteStatus = {
  ACTIVE: 1,
  INACTIVE: 2,
} as const;

export interface Website {
  id: string;
  name: string;
  url: string;
  status: typeof WebsiteStatus[keyof typeof WebsiteStatus];
  createdAt: string;
  updatedAt: string;
  holders?: string[]; // User IDs who have this website
}

export interface WebsitesState {
  websites: Website[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WebsitesState = {
  websites: [],
  isLoading: false,
  error: null,
};

export const websites = createModel<RootModel>()({
  state: initialState,
  reducers: {
    setWebsites(state, websites: Website[]) {
      return { ...state, websites, isLoading: false, error: null };
    },
    setLoading(state, isLoading: boolean) {
      return { ...state, isLoading };
    },
    setError(state, error: string) {
      return { ...state, error, isLoading: false };
    },
    addWebsite(state, website: Website) {
      return {
        ...state,
        websites: [...state.websites, website],
        isLoading: false,
        error: null,
      };
    },
    setWebsite(state, updatedWebsite: Website) {
      return {
        ...state,
        websites: state.websites.map((website) =>
          website.id === updatedWebsite.id ? updatedWebsite : website
        ),
        isLoading: false,
        error: null,
      };
    },
    removeWebsite(state, websiteId: string) {
      return {
        ...state,
        websites: state.websites.filter((website) => website.id !== websiteId),
        isLoading: false,
        error: null,
      };
    },
  },
  effects: (dispatch) => ({
    async fetchWebsites() {
      dispatch.websites.setLoading(true);
      try {
        const response = await apiService.get('/websites');
        if (response.data.success) {
          dispatch.websites.setWebsites(response.data.websites);
        } else {
          dispatch.websites.setError(response.data.error || 'Failed to fetch websites');
        }
      } catch (error: any) {
        dispatch.websites.setError(error.message || 'Failed to fetch websites');
      }
    },
    async createWebsite(websiteData: Partial<Website>) {
      dispatch.websites.setLoading(true);
      try {
        const response = await apiService.post('/websites', websiteData);
        if (response.data.success) {
          dispatch.websites.addWebsite(response.data.website);
          return { success: true, website: response.data.website };
        } else {
          dispatch.websites.setError(response.data.error || 'Failed to create website');
          return { success: false, error: response.data.error };
        }
      } catch (error: any) {
        dispatch.websites.setError(error.message || 'Failed to create website');
        return { success: false, error: error.message };
      }
    },
    async updateWebsite(params: { id: string; data: Partial<Website> } | any) {
      dispatch.websites.setLoading(true);
      try {
        const { id, data } = params;
        const response = await apiService.put(`/websites/${id}`, data);
        if (response.data.success) {
          dispatch.websites.setWebsite(response.data.website);
          return { success: true, website: response.data.website };
        } else {
          dispatch.websites.setError(response.data.error || 'Failed to update website');
          return { success: false, error: response.data.error };
        }
      } catch (error: any) {
        dispatch.websites.setError(error.message || 'Failed to update website');
        return { success: false, error: error.message };
      }
    },
    async deleteWebsite(id: string) {
      dispatch.websites.setLoading(true);
      try {
        const response = await apiService.delete(`/websites/${id}`);
        if (response.data.success) {
          dispatch.websites.removeWebsite(id);
          return { success: true };
        } else {
          dispatch.websites.setError(response.data.error || 'Failed to delete website');
          return { success: false, error: response.data.error };
        }
      } catch (error: any) {
        dispatch.websites.setError(error.message || 'Failed to delete website');
        return { success: false, error: error.message };
      }
    },
    async updateWebsiteStatus({ id, status }: { id: string; status: typeof WebsiteStatus[keyof typeof WebsiteStatus] }) {
      dispatch.websites.setLoading(true);
      try {
        const response = await apiService.patch(`/websites/${id}/status`, { status });
        if (response.data.success) {
          dispatch.websites.setWebsite(response.data.website);
          return { success: true, website: response.data.website };
        } else {
          dispatch.websites.setError(response.data.error || 'Failed to update website status');
          return { success: false, error: response.data.error };
        }
      } catch (error: any) {
        dispatch.websites.setError(error.message || 'Failed to update website status');
        return { success: false, error: error.message };
      }
    },
  }),
});
