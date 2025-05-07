import { createModel } from '@rematch/core';
import type { RootModel } from '@store/models';
import type { Product } from '@utils/types';
import API from '@service/api';

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

export const products = createModel<RootModel>()({
  state: {
    products: [],
    isLoading: false,
    error: null,
  } as ProductsState,

  reducers: {
    setProducts(state, payload: Product[]) {
      return {
        ...state,
        products: payload,
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
    addProduct(state, payload: Product) {
      return {
        ...state,
        products: [...state.products, payload],
      };
    },
    updateProduct(state, payload: Product) {
      return {
        ...state,
        products: state.products.map(product =>
          product.id === payload.id ? payload : product
        ),
      };
    },
    deleteProduct(state, payload: string) {
      return {
        ...state,
        products: state.products.filter(product => product.id !== payload),
      };
    },
  },

  effects: (dispatch) => ({
    async fetchProducts() {
      dispatch.products.setLoading(true);
      try {
        const { data } = await API.get('/products');
        dispatch.products.setProducts(data.products);
        return data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch products';
        dispatch.products.setError(errorMessage);
        return null;
      }
    },

    async createProduct(productData: Omit<Product, 'id'>) {
      dispatch.products.setLoading(true);
      try {
        const { data } = await API.post('/products', productData);
        dispatch.products.addProduct(data);
        return data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to create product';
        dispatch.products.setError(errorMessage);
        return null;
      }
    },

    async updateProduct(productData: Product) {
      dispatch.products.setLoading(true);
      try {
        const { data } = await API.put(`/products/${productData.id}`, productData);
        dispatch.products.updateProduct(data);
        return data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to update product';
        dispatch.products.setError(errorMessage);
        return null;
      }
    },

    async deleteProduct(productId: string) {
      dispatch.products.setLoading(true);
      try {
        await API.delete(`/products/${productId}`);
        dispatch.products.deleteProduct(productId);
        return true;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to delete product';
        dispatch.products.setError(errorMessage);
        return null;
      }
    },
  }),
});
