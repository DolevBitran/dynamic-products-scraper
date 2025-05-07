import { Models } from '@rematch/core';

// Define model state interfaces
export interface FieldsState {
  fieldsData: Field[];
  isLoading: boolean;
  error: string | null;
}

export interface ProductsState {
  scrapedData: Product[];
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  activeTab: string;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

// Define the model interfaces with their state and reducers/effects
export interface FieldsModel {
  state: FieldsState;
  reducers: {
    setFields: (state: FieldsState, payload: Field[]) => FieldsState;
    setLoading: (state: FieldsState, payload: boolean) => FieldsState;
    setError: (state: FieldsState, payload: string) => FieldsState;
  };
  effects: (dispatch: any) => {
    fetchFields: () => Promise<Field[]>;
    updateFields: (fieldsData: Field[]) => Promise<Field[]>;
    getCategoryFields: (_: void, rootState: any) => Field[];
    getProductFields: (_: void, rootState: any) => Field[];
    deleteField: (fieldId: string) => Promise<boolean>;
  };
}

export interface ProductsModel {
  state: ProductsState;
  reducers: {
    setScrapedData: (state: ProductsState, payload: Product[]) => ProductsState;
    setLoading: (state: ProductsState, payload: boolean) => ProductsState;
    setError: (state: ProductsState, payload: string) => ProductsState;
  };
  effects: (dispatch: any) => {
    updateScrapedData: (payload: Product[] | { products: Product[] }, rootState: any) => Promise<Product[]>;
    handleScrapedDataMessage: (payload: any) => Promise<void>;
    initiateScraping: (payload?: { scrapeType?: any }) => void;
    deleteProduct: (productId: string) => Promise<boolean>;
  };
}

export interface UIModel {
  state: UIState;
  reducers: {
    setActiveTab: (state: UIState, payload: string) => UIState;
    setLoading: (state: UIState, payload: boolean) => UIState;
    setInitialized: (state: UIState, payload: boolean) => UIState;
    setError: (state: UIState, payload: string | null) => UIState;
  };
  effects: (dispatch: any) => {
    updateActiveTab: (tab: string) => Promise<void>;
    initializeApp: (_: void, rootState: any) => Promise<void>;
    setupMessageListeners: () => void;
    handleChromeMessage: (payload: { message: any; sender: any; sendResponse: any }) => void;
  };
}

// Define the RootModel interface that extends Models
export interface RootModel extends Models<RootModel> {
  fields: FieldsModel;
  products: ProductsModel;
  ui: UIModel;
}
