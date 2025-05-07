import { createModel } from '@rematch/core';
import type { RootModel } from '@store/models';
import type { Field } from '@utils/types';
import API from '@service/api';

interface FieldsState {
  fields: Field[];
  isLoading: boolean;
  error: string | null;
}

export const fields = createModel<RootModel>()({
  state: {
    fields: [],
    isLoading: false,
    error: null,
  } as FieldsState,

  reducers: {
    setFields(state, payload: Field[]) {
      return {
        ...state,
        fields: payload,
      };
    },
    setLoading(state, payload: boolean) {
      return {
        ...state,
        isLoading: payload,
        error: null,
      };
    },
    setError(state, payload: string) {
      return {
        ...state,
        isLoading: false,
        error: payload,
      };
    },
    addField(state, payload: Field) {
      return {
        ...state,
        fields: [...state.fields, payload],
      };
    },
    updateField(state, payload: Field) {
      return {
        ...state,
        fields: state.fields.map(field =>
          field.id === payload.id ? payload : field
        ),
      };
    },
    deleteField(state, payload: string) {
      return {
        ...state,
        fields: state.fields.filter(field => field.id !== payload),
      };
    },
  },

  effects: (dispatch) => ({
    async fetchFields() {
      dispatch.fields.setLoading(true);
      try {
        const { data } = await API.get('/fields');
        dispatch.fields.setFields(data.fields);
        return data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch fields';
        dispatch.fields.setError(errorMessage);
        return null;
      }
    },

    async createField(fieldData: Omit<Field, 'id'>) {
      dispatch.fields.setLoading(true);
      try {
        const { data } = await API.post('/fields', fieldData);
        dispatch.fields.addField(data);
        return data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to create field';
        dispatch.fields.setError(errorMessage);
        return null;
      }
    },

    async updateField(fieldData: Field) {
      dispatch.fields.setLoading(true);
      try {
        const { data } = await API.put(`/fields/${fieldData.id}`, fieldData);
        dispatch.fields.updateField(data);
        return data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to update field';
        dispatch.fields.setError(errorMessage);
        return null;
      }
    },

    async deleteField(fieldId: string) {
      dispatch.fields.setLoading(true);
      try {
        await API.delete(`/fields/${fieldId}`);
        dispatch.fields.deleteField(fieldId);
        return true;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to delete field';
        dispatch.fields.setError(errorMessage);
        return null;
      }
    },
  }),
});
