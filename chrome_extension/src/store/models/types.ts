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
    deleteField: (fieldId: string, rootState: any) => Promise<boolean>;
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
    deleteProduct: (productId: string, rootState: any) => Promise<boolean>;
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
// Define AuthState interface
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Define User interface
export interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
}

// Define AuthModel interface
export interface AuthModel {
  state: AuthState;
  reducers: {
    setUser: (state: AuthState, user: User | null) => AuthState;
    setToken: (state: AuthState, token: string | null) => AuthState;
    setLoading: (state: AuthState, isLoading: boolean) => AuthState;
    setError: (state: AuthState, error: string | null) => AuthState;
    logout: (state: AuthState) => AuthState;
  };
  effects: (dispatch: any) => {
    login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
    fetchCurrentUser: () => void;
    logoutUser: () => void;
  };
}

export interface RootModel extends Models<RootModel> {
  fields: FieldsModel;
  products: ProductsModel;
  ui: UIModel;
  auth: AuthModel;
}
