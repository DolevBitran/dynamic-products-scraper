import { createModel } from '@rematch/core';
import { RootModel } from './types';
import { IRootState } from '@store/types';
import API from '@service/api';
import { setStorageItem } from '@service/storage';
import { STORAGE_KEYS, ScrapeType } from '@utils/types';

export interface FieldsState {
  fieldsData: Field[];
  isLoading: boolean;
  error: string | null;
}

export const fields = createModel<RootModel>()({
  state: {
    fieldsData: [],
    isLoading: false,
    error: null,
  } as FieldsState,

  reducers: {
    setFields(state: FieldsState, payload: Field[]) {
      return {
        ...state,
        fieldsData: payload,
        isLoading: false,
        error: null,
      };
    },
    setLoading(state: FieldsState, payload: boolean) {
      return {
        ...state,
        isLoading: payload,
      };
    },
    setError(state: FieldsState, payload: string) {
      return {
        ...state,
        error: payload,
        isLoading: false,
      };
    },
  },

  effects: (dispatch: any) => ({
    async fetchFields() {
      dispatch.fields.setLoading(true);
      try {
        const { data }: { data: { fields: Field[] } } = await API.get('/fields');
        dispatch.fields.setFields(data.fields);

        // Store in Chrome storage
        await setStorageItem(STORAGE_KEYS.FIELDS_DATA, data.fields);

        return data.fields;
      } catch (error) {
        console.error('Error fetching fields:', error);
        dispatch.fields.setError('Failed to fetch fields');
        return [];
      }
    },

    async updateFields(fieldsData: Field[]) {
      dispatch.fields.setLoading(true);
      try {
        // Update local state first for immediate UI feedback
        dispatch.fields.setFields(fieldsData);

        // Store in Chrome storage
        await setStorageItem(STORAGE_KEYS.FIELDS_DATA, fieldsData);

        return fieldsData;
      } catch (error) {
        console.error('Error updating fields:', error);
        dispatch.fields.setError('Failed to update fields');
        return [];
      }
    },

    // Get fields by scrape type
    getCategoryFields(_: void, rootState: IRootState): Field[] {
      const { fieldsData } = rootState.fields;
      return fieldsData.filter((field: Field) => field.scrapeType === ScrapeType.CATEGORY);
    },

    // Get fields by product scrape type
    getProductFields(_: void, rootState: IRootState): Field[] {
      const { fieldsData } = rootState.fields;
      return fieldsData.filter((field: Field) => field.scrapeType === ScrapeType.PRODUCT);
    },

    // Delete a field by ID
    async deleteField(fieldId: string) {
      dispatch.fields.setLoading(true);
      try {
        // Make API call to delete the field using URL parameter
        await API.delete(`/fields/${fieldId}`);

        // Update local state after successful deletion
        const { fieldsData } = dispatch.fields.getState();
        const updatedFields = fieldsData.filter((field: Field) => field._id !== fieldId);

        // Update state and storage
        dispatch.fields.setFields(updatedFields);
        await setStorageItem(STORAGE_KEYS.FIELDS_DATA, updatedFields);

        return true;
      } catch (error) {
        console.error('Error deleting field:', error);
        dispatch.fields.setError('Failed to delete field');
        return false;
      }
    },
  }),
});
